"use client";

import { useState, useMemo } from "react";
import { X, Plus, ChevronDown } from "lucide-react";
import type { ModelInfo } from "@/types/benchmark";
import {
  PROVIDER_COLORS,
  TIER_COLORS,
} from "@/lib/config/models";
import { getModelCostPerRun } from "@/lib/wizard/cost-estimator";

interface ModelOverrideProps {
  /** Models recommended by the system */
  recommendedModels: ModelInfo[];
  /** Full curated model list */
  allModels: ModelInfo[];
  /** Currently selected models */
  selectedModels: ModelInfo[];
  /** Called when selection changes */
  onSelectedChange: (models: ModelInfo[]) => void;
}

export function ModelOverride({
  recommendedModels,
  allModels,
  selectedModels,
  onSelectedChange,
}: ModelOverrideProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Check if user has customized from recommendation
  const isCustomized = useMemo(() => {
    const recIds = new Set(recommendedModels.map((m) => m.id));
    const selIds = new Set(selectedModels.map((m) => m.id));
    if (recIds.size !== selIds.size) return true;
    for (const id of recIds) {
      if (!selIds.has(id)) return true;
    }
    return false;
  }, [recommendedModels, selectedModels]);

  // Models available to add (not already selected)
  const availableModels = useMemo(() => {
    const selectedIds = new Set(selectedModels.map((m) => m.id));
    return allModels.filter((m) => !selectedIds.has(m.id));
  }, [allModels, selectedModels]);

  const handleRemove = (modelId: string) => {
    onSelectedChange(selectedModels.filter((m) => m.id !== modelId));
  };

  const handleAdd = (model: ModelInfo) => {
    onSelectedChange([...selectedModels, model]);
    setShowAddMenu(false);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-text-primary">
            Models to Test
          </h3>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-raised text-text-muted">
            {selectedModels.length}
          </span>
          {isCustomized && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-400 uppercase tracking-wider">
              Custom selection
            </span>
          )}
        </div>
      </div>

      {/* Model chips */}
      <div className="flex flex-wrap gap-2">
        {selectedModels.map((model) => (
          <div
            key={model.id}
            className="inline-flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full border border-surface-border bg-surface-raised text-xs group"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                PROVIDER_COLORS[model.provider]
                  ? PROVIDER_COLORS[model.provider].replace("text-", "bg-")
                  : "bg-gray-400"
              }`}
            />
            <span className="text-text-primary font-medium">{model.name}</span>
            <span
              className={`text-[9px] uppercase tracking-wider font-bold ${
                TIER_COLORS[model.tier] ?? "text-text-muted"
              }`}
            >
              {model.tier}
            </span>
            <button
              type="button"
              onClick={() => handleRemove(model.id)}
              className="ml-0.5 p-0.5 rounded-full hover:bg-red-500/20 text-text-muted hover:text-red-400 transition-colors"
              aria-label={`Remove ${model.name}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Add model button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-surface-border text-xs text-text-muted hover:text-text-secondary hover:border-text-muted transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add model
            <ChevronDown
              className={`w-3 h-3 transition-transform ${
                showAddMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown */}
          {showAddMenu && availableModels.length > 0 && (
            <div className="absolute z-20 mt-1 left-0 w-72 max-h-64 overflow-y-auto rounded-xl border border-surface-border bg-surface-raised shadow-xl">
              {availableModels.map((model) => {
                const costPerRun = getModelCostPerRun(model);
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => handleAdd(model)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-surface transition-colors first:rounded-t-xl last:rounded-b-xl"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        PROVIDER_COLORS[model.provider]
                          ? PROVIDER_COLORS[model.provider].replace(
                              "text-",
                              "bg-"
                            )
                          : "bg-gray-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary truncate">
                        {model.name}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {model.provider}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`text-[9px] uppercase tracking-wider font-bold ${
                          TIER_COLORS[model.tier] ?? "text-text-muted"
                        }`}
                      >
                        {model.tier}
                      </span>
                      <p className="text-[10px] text-text-muted">
                        ${costPerRun > 0 ? costPerRun.toFixed(6) : "free"}/run
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Click outside to close */}
          {showAddMenu && (
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowAddMenu(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
