import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { transformRunsToReport } from "@/lib/report/aggregate";
import { generateRationale } from "@/lib/report/recommendation";
import { aggregateErrorPatterns } from "@/lib/report/error-patterns";
import { ReportHeader } from "@/components/report/report-header";
import { RecommendationCard } from "@/components/report/recommendation-card";
import { RankedTable } from "@/components/report/ranked-table";
import { BubbleChart } from "@/components/report/bubble-chart";
import { LatencyChart } from "@/components/report/latency-chart";
import { CostChart } from "@/components/report/cost-chart";
import { CostCalculator } from "@/components/report/cost-calculator";
import { ErrorAnalysis } from "@/components/report/error-analysis";
import { RawRuns } from "@/components/report/raw-runs";
import { PdfExportButton } from "@/components/report/pdf-export-button";
import type { Report, BenchmarkRun } from "@/types/database";

interface ReportPageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Benchmark Report | ModelBlitz",
    description:
      "Vision model benchmark results comparing accuracy, cost, and latency across models.",
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { token } = await params;

  const supabase = await createClient();

  // Load report by share_token
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .select("*")
    .eq("share_token", token)
    .single();

  if (reportError || !report) {
    notFound();
  }

  const typedReport = report as unknown as Report;

  // Only show complete reports
  if (typedReport.status !== "complete") {
    notFound();
  }

  // Load all benchmark runs for this report
  const { data: runs, error: runsError } = await supabase
    .from("benchmark_runs")
    .select("*")
    .eq("report_id", typedReport.id)
    .order("model_id");

  if (runsError || !runs) {
    notFound();
  }

  const typedRuns = runs as unknown as BenchmarkRun[];

  // Transform raw data into report view model
  const reportData = transformRunsToReport(typedRuns, typedReport);

  // Generate recommendation rationale
  const recommended = reportData.models.find(
    (m) => m.modelId === reportData.recommendedModelId
  );

  let rationale = "";
  if (recommended) {
    rationale = generateRationale(
      recommended,
      reportData.models,
      reportData.priorities
    );
  }

  // Build runs-by-model groupings for charts and analysis
  const runsByModelMap = new Map<string, BenchmarkRun[]>();
  for (const run of typedRuns) {
    const existing = runsByModelMap.get(run.model_id) ?? [];
    existing.push(run);
    runsByModelMap.set(run.model_id, existing);
  }

  // Compute error patterns from raw runs
  const errorPatterns = aggregateErrorPatterns(
    reportData.models,
    runsByModelMap
  );

  // Serialize to Record for client components
  const runsByModelRecord: Record<string, BenchmarkRun[]> = {};
  for (const [modelId, modelRuns] of runsByModelMap) {
    runsByModelRecord[modelId] = modelRuns;
  }

  // Build error-only run data for ErrorAnalysis (strip output_json to reduce payload)
  const errorRunsByModel: Record<
    string,
    Array<{
      field_errors: Array<{
        fieldPath: string;
        expected: string;
        actual: string;
      }>;
      exact_match: boolean;
    }>
  > = {};
  for (const [modelId, modelRuns] of runsByModelMap) {
    errorRunsByModel[modelId] = modelRuns
      .filter((r) => r.status === "complete")
      .map((r) => ({
        field_errors: (
          r.field_errors as Array<{
            fieldPath: string;
            expected: string;
            actual: string;
          }>
        ).filter((e) => e && e.fieldPath),
        exact_match: r.exact_match,
      }));
  }

  // Prepare chart data
  const bubbleData = reportData.models.map((m) => ({
    modelName: m.modelName,
    cost: m.costPerRun,
    accuracy: m.accuracy,
    p95: m.p95Latency,
    spread: m.spread,
    provider: m.provider,
  }));

  const latencyData = reportData.models.map((m) => ({
    modelName: m.modelName,
    p95: m.p95Latency,
    provider: m.provider,
  }));

  const costData = reportData.models.map((m) => ({
    modelName: m.modelName,
    costPerRun: m.costPerRun,
    provider: m.provider,
  }));

  return (
    <div
      id="report-content"
      className="max-w-6xl mx-auto px-6 py-8 space-y-8"
    >
      <ReportHeader reportData={reportData} shareToken={token}>
        <PdfExportButton />
      </ReportHeader>

      <section className="space-y-6">
        <RecommendationCard
          recommended={recommended}
          rationale={rationale}
          models={reportData.models}
        />
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-text-primary">
          Model Rankings
        </h2>
        <RankedTable models={reportData.models} />
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-text-primary">
          Visualizations
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-raised rounded-xl p-5 border border-surface-border">
            <h3 className="text-sm font-semibold text-text-secondary mb-3">
              Accuracy vs Cost
            </h3>
            <BubbleChart data={bubbleData} />
          </div>
          <div className="bg-surface-raised rounded-xl p-5 border border-surface-border">
            <h3 className="text-sm font-semibold text-text-secondary mb-3">
              P95 Latency
            </h3>
            <LatencyChart data={latencyData} />
          </div>
        </div>
        <div className="bg-surface-raised rounded-xl p-5 border border-surface-border">
          <h3 className="text-sm font-semibold text-text-secondary mb-3">
            Cost per Run
          </h3>
          <p className="text-xs text-text-muted mb-4">
            Costs reflect your benchmark results using OpenRouter API pricing.
          </p>
          <CostChart data={costData} />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-text-primary">
          Where It Missed
        </h2>
        <ErrorAnalysis
          models={reportData.models}
          errorPatterns={errorPatterns}
          runsByModel={errorRunsByModel}
        />
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-text-primary">
          Cost Calculator
        </h2>
        <CostCalculator
          models={reportData.models}
          recommendedModelId={reportData.recommendedModelId}
        />
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-text-primary">
          Raw Run Data
        </h2>
        <RawRuns
          models={reportData.models}
          runsByModel={runsByModelRecord}
        />
      </section>
    </div>
  );
}
