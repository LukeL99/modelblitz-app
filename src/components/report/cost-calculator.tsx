"use client";

import { useState } from "react";
import type { ModelSummary } from "@/types/report";

interface CostCalculatorProps {
  models: ModelSummary[];
  recommendedModelId: string | null;
}

function formatMoney(amount: number): string {
  if (amount < 0.01 && amount > 0) return `$${amount.toFixed(4)}`;
  if (amount < 1) return `$${amount.toFixed(2)}`;
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function CostCalculator({
  models,
  recommendedModelId,
}: CostCalculatorProps) {
  const recommended = models.find((m) => m.modelId === recommendedModelId);

  // Default comparison: most expensive model
  const sortedByCost = [...models].sort(
    (a, b) => b.costPerRun - a.costPerRun
  );
  const defaultComparison = sortedByCost.find(
    (m) => m.modelId !== recommendedModelId
  );

  const [dailyVolume, setDailyVolume] = useState(100);
  const [comparisonModelId, setComparisonModelId] = useState(
    defaultComparison?.modelId ?? ""
  );

  const comparison = models.find((m) => m.modelId === comparisonModelId);

  if (!recommended) {
    return (
      <p className="text-text-muted text-sm">
        No recommended model available for cost calculation.
      </p>
    );
  }

  const monthlyCostRecommended = recommended.costPerRun * dailyVolume * 30;
  const monthlyCostComparison = comparison
    ? comparison.costPerRun * dailyVolume * 30
    : 0;
  const monthlySavings = monthlyCostComparison - monthlyCostRecommended;
  const yearlySavings = monthlySavings * 12;

  const quickSets = [100, 500, 1000, 5000];

  return (
    <div className="space-y-6">
      {/* Volume slider */}
      <div className="space-y-3">
        <label
          htmlFor="daily-volume"
          className="block text-sm font-medium text-text-secondary"
        >
          Daily API calls:{" "}
          <span className="text-text-primary font-semibold">
            {dailyVolume.toLocaleString()}
          </span>
        </label>
        <input
          id="daily-volume"
          type="range"
          min={10}
          max={10000}
          step={10}
          value={dailyVolume}
          onChange={(e) => setDailyVolume(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-ember bg-surface-border"
        />
        <div className="flex gap-2">
          {quickSets.map((val) => (
            <button
              key={val}
              onClick={() => setDailyVolume(val)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                dailyVolume === val
                  ? "bg-ember/20 text-ember border border-ember/40"
                  : "bg-surface-raised text-text-muted border border-surface-border hover:text-text-secondary"
              }`}
            >
              {val.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Model comparison dropdown */}
      <div className="space-y-2">
        <label
          htmlFor="comparison-model"
          className="block text-sm font-medium text-text-secondary"
        >
          Compare with:
        </label>
        <select
          id="comparison-model"
          value={comparisonModelId}
          onChange={(e) => setComparisonModelId(e.target.value)}
          className="w-full max-w-xs px-3 py-2 text-sm bg-surface-raised border border-surface-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-surface-border"
        >
          {models
            .filter((m) => m.modelId !== recommendedModelId)
            .map((m) => (
              <option key={m.modelId} value={m.modelId}>
                {m.modelName} ({formatMoney(m.costPerRun)}/run)
              </option>
            ))}
        </select>
      </div>

      {/* Cost cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Recommended model card */}
        <div className="bg-surface-raised rounded-xl p-5 border border-surface-border space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">
              Recommended
            </span>
          </div>
          <p className="text-sm font-medium text-text-primary">
            {recommended.modelName}
          </p>
          <p className="text-2xl font-bold text-text-primary">
            {formatMoney(monthlyCostRecommended)}
            <span className="text-sm font-normal text-text-muted">/month</span>
          </p>
          <p className="text-xs text-text-muted">
            {formatMoney(recommended.costPerRun)} per run
          </p>
        </div>

        {/* Comparison model card */}
        {comparison && (
          <div className="bg-surface-raised rounded-xl p-5 border border-surface-border space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-surface text-text-muted">
                Comparison
              </span>
            </div>
            <p className="text-sm font-medium text-text-primary">
              {comparison.modelName}
            </p>
            <p className="text-2xl font-bold text-text-primary">
              {formatMoney(monthlyCostComparison)}
              <span className="text-sm font-normal text-text-muted">
                /month
              </span>
            </p>
            <p className="text-xs text-text-muted">
              {formatMoney(comparison.costPerRun)} per run
            </p>
          </div>
        )}
      </div>

      {/* Savings callout */}
      {comparison && monthlySavings > 0 && (
        <div className="rounded-xl p-5 border border-emerald-500/30 bg-emerald-500/10">
          <p className="text-lg font-semibold text-emerald-400">
            Save {formatMoney(monthlySavings)}/month ({formatMoney(yearlySavings)}
            /year)
          </p>
          <p className="text-sm text-emerald-400/70 mt-1">
            by using {recommended.modelName} instead of {comparison.modelName}
          </p>
        </div>
      )}

      {comparison && monthlySavings < 0 && (
        <div className="rounded-xl p-5 border border-amber-500/30 bg-amber-500/10">
          <p className="text-lg font-semibold text-amber-400">
            Costs {formatMoney(Math.abs(monthlySavings))}/month more
          </p>
          <p className="text-sm text-amber-400/70 mt-1">
            {recommended.modelName} is pricier than {comparison.modelName}, but
            may offer better accuracy
          </p>
        </div>
      )}
    </div>
  );
}
