/**
 * Benchmark engine orchestration loop.
 *
 * Coordinates running all selected models against all images with:
 * - Per-model concurrency limit (3) and global concurrency limit (10) via p-limit
 * - Cost ceiling enforcement ($7 soft / $15 hard)
 * - Graceful shutdown at 750s elapsed time
 * - Real-time benchmark_run recording to database
 * - Aggregate result calculation and model recommendation
 * - Report completion email via Resend
 */

import pLimit from "p-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { getModelById } from "@/lib/config/models";
import {
  API_BUDGET_CEILING,
  HARD_COST_CEILING,
  PER_MODEL_CONCURRENCY,
  GLOBAL_CONCURRENCY,
} from "@/lib/config/constants";
import { CostTracker } from "./cost-tracker";
import { runModelBenchmark, type RunResult } from "./runner";
import {
  compareStrict,
  calculateFieldAccuracy,
  diffFields,
} from "./json-compare";
import {
  estimateCost,
  optimizeRunsForBudget,
} from "@/lib/wizard/cost-estimator";
import type { ModelInfo } from "@/types/benchmark";

/** Maximum benchmark execution time in seconds before graceful shutdown */
const MAX_EXECUTION_TIME_S = 750;

/** Log prefix for structured logging */
function log(reportId: string, ...args: unknown[]) {
  console.log(`[benchmark:${reportId}]`, ...args);
}

/**
 * A single work item to execute: one model + one image + one run number.
 */
interface ExecutionItem {
  modelId: string;
  modelInfo: ModelInfo;
  imageIndex: number;
  imageUrl: string;
  expectedJson: Record<string, unknown>;
  runNumber: number;
}

/**
 * Run the full benchmark for a report.
 *
 * Loads the report config, iterates over all model+image combinations
 * with concurrency control, records results to the database, calculates
 * aggregate scores, determines the recommended model, and sends a
 * completion email.
 */
export async function runBenchmark(reportId: string): Promise<void> {
  const startTime = performance.now();
  const startEpoch = Date.now();
  log(reportId, "Starting benchmark execution");

  const admin = createAdminClient();

  try {
    // ── Step 1: Load report and prepare execution plan ──────────────────

    const { data: report, error: reportError } = await admin
      .from("reports")
      .select("*")
      .eq("id", reportId)
      .single();

    if (reportError || !report) {
      log(reportId, "Report not found:", reportError);
      return;
    }

    if (report.status !== "paid") {
      log(reportId, `Report status is '${report.status}', expected 'paid'. Skipping.`);
      return;
    }

    // Update status to running
    await admin
      .from("reports")
      .update({ status: "running", started_at: new Date().toISOString() })
      .eq("id", reportId);

    log(reportId, "Status updated to 'running'");

    // Extract config from snapshot
    const config = report.config_snapshot as Record<string, unknown>;
    const selectedModelIds = (config.selected_models as string[]) ?? [];
    const extractionPrompt = (report.extraction_prompt as string) ?? "";
    const jsonSchema = (report.json_schema as Record<string, unknown>) ?? {};
    const imagePaths = (report.image_paths as string[]) ?? [];
    const runsPerModel = (config.sampleCount as number) ?? 3;

    // Load expected JSON for each image from upload_data
    const uploadData = (config.upload_data as Record<string, unknown>) ?? {};
    const images = (uploadData.images as Array<{
      path: string;
      publicUrl: string;
      expectedJson?: string;
      parsedJson?: unknown;
      jsonValid?: boolean;
    }>) ?? [];

    // Build expected JSON map: imageIndex -> expected parsed JSON
    const expectedJsonMap = new Map<number, Record<string, unknown>>();
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      let expected: Record<string, unknown> | null = null;

      if (img.parsedJson && typeof img.parsedJson === "object") {
        expected = img.parsedJson as Record<string, unknown>;
      } else if (img.expectedJson) {
        try {
          expected = JSON.parse(img.expectedJson) as Record<string, unknown>;
        } catch {
          log(reportId, `Failed to parse expected JSON for image ${i}`);
        }
      }

      if (expected) {
        expectedJsonMap.set(i, expected);
      }
    }

    // Build image URLs from public URLs in upload_data
    const imageUrls = images.map((img) => img.publicUrl);

    // Resolve model info
    const models: ModelInfo[] = [];
    for (const modelId of selectedModelIds) {
      const info = getModelById(modelId);
      if (info) {
        models.push(info);
      } else {
        log(reportId, `Model not found in curated list: ${modelId}, skipping`);
      }
    }

    if (models.length === 0) {
      log(reportId, "No valid models found. Marking report as failed.");
      await admin
        .from("reports")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", reportId);
      return;
    }

    log(
      reportId,
      `Execution plan: ${models.length} models x ${imageUrls.length} images x ${runsPerModel} runs = ${models.length * imageUrls.length * runsPerModel} total runs`
    );

    // ── Step 2: Pre-calculate budget and enforce limits ─────────────────

    let effectiveRunsPerModel = runsPerModel;

    const costEstimate = estimateCost({
      selectedModels: models,
      runsPerModel: effectiveRunsPerModel,
      sampleCount: imageUrls.length,
    });

    log(
      reportId,
      `Projected cost: $${costEstimate.estimatedCost.toFixed(4)} vs budget ceiling $${API_BUDGET_CEILING}`
    );

    // Defense-in-depth: re-check budget (checkout API did primary validation)
    if (costEstimate.estimatedCost > API_BUDGET_CEILING) {
      const optimized = optimizeRunsForBudget(models, imageUrls.length);
      log(
        reportId,
        `Budget exceeded. Optimizing runs from ${effectiveRunsPerModel} to ${optimized}`
      );
      effectiveRunsPerModel = optimized;

      // If even 1 run per model exceeds budget, fail
      if (effectiveRunsPerModel < 1) {
        log(reportId, "Configuration exceeds budget at minimum runs. Failing.");
        await admin
          .from("reports")
          .update({
            status: "failed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", reportId);
        return;
      }
    }

    // Create cost tracker with dual ceilings
    const costTracker = new CostTracker(API_BUDGET_CEILING, HARD_COST_CEILING);

    // ── Step 3: Set up concurrency control ──────────────────────────────

    const globalLimit = pLimit(GLOBAL_CONCURRENCY);
    const modelLimiters = new Map<string, ReturnType<typeof pLimit>>();
    for (const model of models) {
      modelLimiters.set(model.id, pLimit(PER_MODEL_CONCURRENCY));
    }

    // ── Step 4: Execute benchmark runs ──────────────────────────────────

    // Build execution items
    const executionItems: ExecutionItem[] = [];
    for (const model of models) {
      for (let imgIdx = 0; imgIdx < imageUrls.length; imgIdx++) {
        const expected = expectedJsonMap.get(imgIdx) ?? {};
        for (let run = 1; run <= effectiveRunsPerModel; run++) {
          executionItems.push({
            modelId: model.id,
            modelInfo: model,
            imageIndex: imgIdx,
            imageUrl: imageUrls[imgIdx],
            expectedJson: expected,
            runNumber: run,
          });
        }
      }
    }

    let completedCount = 0;
    let skippedCount = 0;

    const executeRun = async (item: ExecutionItem): Promise<void> => {
      // Check cost ceiling
      if (costTracker.shouldAbort()) {
        skippedCount++;
        await admin.from("benchmark_runs").insert({
          report_id: reportId,
          model_id: item.modelId,
          image_index: item.imageIndex,
          run_number: item.runNumber,
          status: "skipped",
          is_valid_json: false,
          exact_match: false,
          field_errors: [],
          error_message: "Cost ceiling reached",
        });
        return;
      }

      // Check elapsed time for graceful shutdown
      const elapsedS = (performance.now() - startTime) / 1000;
      if (elapsedS > MAX_EXECUTION_TIME_S) {
        skippedCount++;
        await admin.from("benchmark_runs").insert({
          report_id: reportId,
          model_id: item.modelId,
          image_index: item.imageIndex,
          run_number: item.runNumber,
          status: "skipped",
          is_valid_json: false,
          exact_match: false,
          field_errors: [],
          error_message: "Graceful shutdown: time limit exceeded",
        });
        return;
      }

      // Insert running record
      const { data: runRecord } = await admin
        .from("benchmark_runs")
        .insert({
          report_id: reportId,
          model_id: item.modelId,
          image_index: item.imageIndex,
          run_number: item.runNumber,
          status: "running",
          is_valid_json: false,
          exact_match: false,
          field_errors: [],
        })
        .select("id")
        .single();

      const runId = runRecord?.id;

      try {
        // Execute the model benchmark
        const result: RunResult = await runModelBenchmark({
          modelId: item.modelId,
          imageUrl: item.imageUrl,
          extractionPrompt: extractionPrompt,
          jsonSchema: jsonSchema,
          costTracker: costTracker,
        });

        if (result.error) {
          // Run failed
          if (runId) {
            await admin
              .from("benchmark_runs")
              .update({
                status: "failed",
                error_message: result.error,
                response_time_ms: Math.round(result.responseTimeMs),
                input_tokens: result.inputTokens,
                output_tokens: result.outputTokens,
                actual_cost: result.actualCost,
              })
              .eq("id", runId);
          }
          return;
        }

        // Compare output against expected JSON
        const outputJson = result.outputJson as Record<string, unknown> | null;
        let exactMatch = false;
        let fieldAccuracy: number | null = null;
        let fieldErrors: Array<{ fieldPath: string; expected: string; actual: string }> = [];

        if (outputJson && typeof outputJson === "object" && result.isValidJson) {
          exactMatch = compareStrict(item.expectedJson, outputJson);
          const accuracy = calculateFieldAccuracy(
            item.expectedJson,
            outputJson,
            "strict"
          );
          fieldAccuracy = accuracy.accuracy;
          fieldErrors = diffFields(item.expectedJson, outputJson, "strict");
        }

        // Calculate estimated cost for this specific model call
        const model = item.modelInfo;
        const estimatedInputTokens = 1500;
        const estimatedOutputTokens = 500;
        const estimatedCost = model
          ? (estimatedInputTokens / 1_000_000) * model.inputCostPer1M +
            (estimatedOutputTokens / 1_000_000) * model.outputCostPer1M
          : 0.01;

        // Update benchmark_run record with results
        if (runId) {
          await admin
            .from("benchmark_runs")
            .update({
              output_json: outputJson ?? null,
              is_valid_json: result.isValidJson,
              exact_match: exactMatch,
              field_accuracy: fieldAccuracy,
              field_errors: fieldErrors,
              response_time_ms: Math.round(result.responseTimeMs),
              input_tokens: result.inputTokens,
              output_tokens: result.outputTokens,
              actual_cost: result.actualCost,
              estimated_cost: estimatedCost,
              status: "complete",
            })
            .eq("id", runId);
        }

        completedCount++;
      } catch (err) {
        // Unexpected error
        if (runId) {
          await admin
            .from("benchmark_runs")
            .update({
              status: "failed",
              error_message:
                err instanceof Error ? err.message : "Unknown error",
            })
            .eq("id", runId);
        }
      }
    };

    // Create all tasks with concurrency control
    const tasks = executionItems.map((item) => {
      const modelLimiter = modelLimiters.get(item.modelId)!;
      return globalLimit(() => modelLimiter(() => executeRun(item)));
    });

    // Wait for all tasks (don't fail on individual errors)
    await Promise.allSettled(tasks);

    log(
      reportId,
      `Execution complete: ${completedCount} completed, ${skippedCount} skipped, total cost $${costTracker.getSpent().toFixed(4)}`
    );

    // ── Step 5: Calculate aggregate results ─────────────────────────────

    const { data: allRuns } = await admin
      .from("benchmark_runs")
      .select("*")
      .eq("report_id", reportId);

    if (!allRuns || allRuns.length === 0) {
      log(reportId, "No runs found. Marking report as failed.");
      await admin
        .from("reports")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          total_api_cost: costTracker.getSpent(),
        })
        .eq("id", reportId);
      return;
    }

    // Group by model_id
    const runsByModel = new Map<string, typeof allRuns>();
    for (const run of allRuns) {
      const existing = runsByModel.get(run.model_id) ?? [];
      existing.push(run);
      runsByModel.set(run.model_id, existing);
    }

    // Calculate per-model aggregates
    interface ModelAggregate {
      modelId: string;
      accuracy: number;
      exactMatchRate: number;
      costPerCall: number;
      medianLatency: number;
      p95Latency: number;
      spread: number;
      runsCompleted: number;
      runsAttempted: number;
    }

    const aggregates: ModelAggregate[] = [];

    for (const [modelId, runs] of runsByModel) {
      const completedRuns = runs.filter((r) => r.status === "complete");
      const runsAttempted = runs.length;
      const runsCompleted = completedRuns.length;

      if (runsCompleted === 0) {
        aggregates.push({
          modelId,
          accuracy: 0,
          exactMatchRate: 0,
          costPerCall: 0,
          medianLatency: 0,
          p95Latency: 0,
          spread: 0,
          runsCompleted: 0,
          runsAttempted,
        });
        continue;
      }

      // Accuracy: average field_accuracy across completed runs
      const accuracies = completedRuns
        .map((r) => r.field_accuracy ?? 0)
        .filter((a) => typeof a === "number");
      const avgAccuracy =
        accuracies.length > 0
          ? accuracies.reduce((s, a) => s + a, 0) / accuracies.length
          : 0;

      // Exact match rate
      const exactMatches = completedRuns.filter((r) => r.exact_match).length;
      const exactMatchRate =
        runsCompleted > 0 ? (exactMatches / runsCompleted) * 100 : 0;

      // Cost per call: average actual_cost
      const costs = completedRuns
        .map((r) => r.actual_cost ?? 0)
        .filter((c) => typeof c === "number");
      const costPerCall =
        costs.length > 0
          ? costs.reduce((s, c) => s + c, 0) / costs.length
          : 0;

      // Latencies
      const latencies = completedRuns
        .map((r) => r.response_time_ms ?? 0)
        .filter((l) => typeof l === "number" && l > 0)
        .sort((a, b) => a - b);

      const medianLatency =
        latencies.length > 0
          ? latencies[Math.floor(latencies.length / 2)]
          : 0;

      const p95Index = Math.min(
        Math.ceil(latencies.length * 0.95) - 1,
        latencies.length - 1
      );
      const p95Latency =
        latencies.length > 0 ? latencies[Math.max(0, p95Index)] : 0;

      // Spread: standard deviation of field_accuracy
      const mean = avgAccuracy;
      const squaredDiffs = accuracies.map((a) => Math.pow(a - mean, 2));
      const variance =
        squaredDiffs.length > 0
          ? squaredDiffs.reduce((s, d) => s + d, 0) / squaredDiffs.length
          : 0;
      const spread = Math.sqrt(variance);

      aggregates.push({
        modelId,
        accuracy: Math.round(avgAccuracy * 100) / 100,
        exactMatchRate: Math.round(exactMatchRate * 100) / 100,
        costPerCall: Math.round(costPerCall * 1000000) / 1000000,
        medianLatency: Math.round(medianLatency),
        p95Latency: Math.round(p95Latency),
        spread: Math.round(spread * 100) / 100,
        runsCompleted,
        runsAttempted,
      });
    }

    // ── Step 6: Determine recommended model ─────────────────────────────

    const priorities = (config.priorities as string[]) ?? [
      "accuracy",
      "speed",
      "cost",
    ];

    // Score each model using priority-weighted scoring
    // Priority weights: position 0 = 3x, position 1 = 2x, position 2 = 1x
    const priorityWeights: Record<string, number> = {};
    for (let i = 0; i < priorities.length; i++) {
      priorityWeights[priorities[i]] = priorities.length - i;
    }

    // Normalize metrics for scoring (higher = better)
    const maxAccuracy = Math.max(...aggregates.map((a) => a.accuracy), 1);
    const maxLatency = Math.max(...aggregates.map((a) => a.medianLatency), 1);
    const maxCost = Math.max(...aggregates.map((a) => a.costPerCall), 0.000001);

    let bestScore = -Infinity;
    let recommendedModelId: string | null = null;

    for (const agg of aggregates) {
      if (agg.runsCompleted === 0) continue;

      // Normalize: accuracy is already 0-100, higher is better
      const accuracyScore = agg.accuracy / maxAccuracy;
      // Speed: lower latency is better, invert
      const speedScore = 1 - agg.medianLatency / maxLatency;
      // Cost: lower cost is better, invert
      const costScore = 1 - agg.costPerCall / maxCost;

      const score =
        (priorityWeights["accuracy"] ?? 1) * accuracyScore +
        (priorityWeights["speed"] ?? 1) * speedScore +
        (priorityWeights["cost"] ?? 1) * costScore;

      if (score > bestScore) {
        bestScore = score;
        recommendedModelId = agg.modelId;
      }
    }

    log(reportId, `Recommended model: ${recommendedModelId}`);

    // Update report with results
    const totalApiCost = costTracker.getSpent();
    const modelCount = models.length;

    await admin
      .from("reports")
      .update({
        recommended_model: recommendedModelId,
        total_api_cost: totalApiCost,
        model_count: modelCount,
      })
      .eq("id", reportId);

    log(
      reportId,
      `Predicted cost: $${costEstimate.estimatedCost.toFixed(4)}, Actual cost: $${totalApiCost.toFixed(4)}`
    );

    // ── Step 7: Complete report ─────────────────────────────────────────

    await admin
      .from("reports")
      .update({
        status: "complete",
        completed_at: new Date().toISOString(),
      })
      .eq("id", reportId);

    const elapsedS = (performance.now() - startTime) / 1000;
    log(reportId, `Report complete in ${elapsedS.toFixed(1)}s`);

    // Send completion email (non-fatal)
    try {
      // Look up user email
      const { data: userData } = await admin.auth.admin.getUserById(
        report.user_id
      );
      const userEmail = userData?.user?.email;

      if (userEmail && report.share_token) {
        const { sendReportReadyEmail } = await import(
          "@/lib/email/send-report-ready"
        );
        await sendReportReadyEmail({
          to: userEmail,
          reportId: reportId,
          shareToken: report.share_token,
          modelCount: modelCount,
          imageCount: imageUrls.length,
          recommendedModel: recommendedModelId
            ? (getModelById(recommendedModelId)?.name ?? recommendedModelId)
            : null,
        });
      } else {
        log(
          reportId,
          "Skipping email: no user email or share token available"
        );
      }
    } catch (emailErr) {
      log(reportId, "Email send failed (non-fatal):", emailErr);
    }
  } catch (err) {
    // Unrecoverable error -- ensure report gets terminal status
    log(reportId, "Fatal error:", err);
    try {
      await admin
        .from("reports")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", reportId);
    } catch (updateErr) {
      log(reportId, "Failed to update report status:", updateErr);
    }
  }
}
