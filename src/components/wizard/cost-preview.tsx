"use client";

import { useMemo } from "react";
import {
  Clock,
  Cpu,
  DollarSign,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import type { ModelInfo, ModelTier } from "@/types/benchmark";
import { estimateCost, type CostEstimate } from "@/lib/wizard/cost-estimator";
import { API_BUDGET_CEILING } from "@/lib/config/constants";

interface CostPreviewProps {
  selectedModels: ModelInfo[];
  runsPerModel: number;
  sampleCount: number;
}

const CONFIDENCE_COLORS: Record<string, string> = {
  low: "bg-red-500/15 text-red-400",
  medium: "bg-amber-500/15 text-amber-400",
  high: "bg-emerald-500/15 text-emerald-400",
};

export function CostPreview({
  selectedModels,
  runsPerModel,
  sampleCount,
}: CostPreviewProps) {
  const estimate: CostEstimate = useMemo(
    () =>
      estimateCost({
        selectedModels,
        runsPerModel,
        sampleCount,
      }),
    [selectedModels, runsPerModel, sampleCount]
  );

  // Calculate tier breakdown
  const tierBreakdown = useMemo(() => {
    const counts: Partial<Record<ModelTier, number>> = {};
    for (const model of selectedModels) {
      counts[model.tier] = (counts[model.tier] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([tier, count]) => `${count} ${tier}`)
      .join(", ");
  }, [selectedModels]);

  const budgetPercent = Math.min(estimate.budgetUtilization, 100);
  const isOverBudget = estimate.estimatedCost > API_BUDGET_CEILING;

  return (
    <div className="rounded-xl border border-surface-border bg-surface p-5 space-y-4">
      <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-ember" />
        Cost Preview
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Models to test */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted">
            <Cpu className="w-3.5 h-3.5" />
            <span className="text-xs">Models to test</span>
          </div>
          <p className="text-sm font-medium text-text-primary">
            {selectedModels.length} models
          </p>
          {tierBreakdown && (
            <p className="text-[10px] text-text-muted">{tierBreakdown}</p>
          )}
        </div>

        {/* Total runs */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted">
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="text-xs">Total runs</span>
          </div>
          <p className="text-sm font-medium text-text-primary">
            {estimate.totalRuns.toLocaleString()} runs
          </p>
          <p className="text-[10px] text-text-muted">
            {selectedModels.length} x {runsPerModel} x {sampleCount}
          </p>
        </div>

        {/* Estimated time */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">Estimated time</span>
          </div>
          <p className="text-sm font-medium text-text-primary">
            ~{estimate.estimatedTimeMinutes} min
          </p>
        </div>

        {/* Confidence level */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-text-muted">
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="text-xs">Confidence</span>
          </div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              CONFIDENCE_COLORS[estimate.confidenceLevel]
            }`}
          >
            {estimate.confidenceLevel}
          </span>
        </div>
      </div>

      {/* Cost bar */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-text-muted">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="text-xs">Estimated API cost</span>
          </div>
          <span className="text-sm font-semibold text-text-primary">
            ${estimate.estimatedCost.toFixed(2)}{" "}
            <span className="text-text-muted font-normal">
              of ${API_BUDGET_CEILING.toFixed(2)}
            </span>
          </span>
        </div>
        <div className="h-2 rounded-full bg-surface-raised overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOverBudget ? "bg-red-500" : "bg-ember"
            }`}
            style={{ width: `${budgetPercent}%` }}
          />
        </div>
      </div>

      {/* Over-budget warning */}
      {estimate.warning && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-300/80">{estimate.warning}</p>
        </div>
      )}

      {/* Footer disclaimer */}
      <p className="text-[10px] text-text-muted pt-1">
        Prices as of {estimate.pricesAsOf}. Actual costs may vary slightly.
      </p>
    </div>
  );
}
