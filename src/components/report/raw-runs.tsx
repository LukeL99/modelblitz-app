"use client";

import { useState } from "react";
import type { ModelSummary } from "@/types/report";
import type { BenchmarkRun } from "@/types/database";

interface RawRunsProps {
  models: ModelSummary[];
  runsByModel: Record<string, BenchmarkRun[]>;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    complete: "bg-emerald-500/15 text-emerald-400",
    failed: "bg-red-500/15 text-red-400",
    skipped: "bg-gray-500/15 text-gray-400",
    pending: "bg-amber-500/15 text-amber-400",
    running: "bg-blue-500/15 text-blue-400",
  };

  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded ${styles[status] ?? styles.pending}`}
    >
      {status}
    </span>
  );
}

export function RawRuns({ models, runsByModel }: RawRunsProps) {
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  function toggleModel(modelId: string) {
    if (expandedModel === modelId) {
      setExpandedModel(null);
      setExpandedRun(null);
    } else {
      setExpandedModel(modelId);
      setExpandedRun(null);
    }
  }

  return (
    <div className="space-y-3">
      {models.map((model) => {
        const runs = runsByModel[model.modelId] ?? [];
        const isExpanded = expandedModel === model.modelId;

        return (
          <div
            key={model.modelId}
            className="bg-surface-raised rounded-xl border border-surface-border overflow-hidden"
          >
            {/* Summary row */}
            <button
              onClick={() => toggleModel(model.modelId)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs transition-transform ${isExpanded ? "rotate-90" : ""}`}
                >
                  &#9654;
                </span>
                <span className="font-medium text-text-primary text-sm">
                  {model.modelName}
                </span>
                <span className="text-xs text-text-muted">
                  {model.runsCompleted}/{model.runsAttempted} runs
                </span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-surface text-text-muted">
                {model.accuracy.toFixed(1)}%
              </span>
            </button>

            {/* Expanded content */}
            {isExpanded && (
              <div className="px-5 pb-4">
                {runs.length === 0 ? (
                  <p className="text-sm text-text-muted py-2">
                    No run data available.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-surface-border">
                          <th className="text-left py-2 pr-3 text-text-muted font-medium text-xs">
                            Run #
                          </th>
                          <th className="text-left py-2 pr-3 text-text-muted font-medium text-xs">
                            Image
                          </th>
                          <th className="text-left py-2 pr-3 text-text-muted font-medium text-xs">
                            Status
                          </th>
                          <th className="text-center py-2 pr-3 text-text-muted font-medium text-xs">
                            Exact
                          </th>
                          <th className="text-right py-2 pr-3 text-text-muted font-medium text-xs">
                            Accuracy
                          </th>
                          <th className="text-right py-2 pr-3 text-text-muted font-medium text-xs">
                            Latency
                          </th>
                          <th className="text-right py-2 text-text-muted font-medium text-xs">
                            Cost
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {runs.map((run) => {
                          const runKey = run.id;
                          const isRunExpanded = expandedRun === runKey;

                          return (
                            <tr key={runKey} className="group">
                              <td
                                colSpan={7}
                                className="p-0 border-b border-surface-border/50 last:border-0"
                              >
                                {/* Run row */}
                                <button
                                  onClick={() =>
                                    setExpandedRun(
                                      isRunExpanded ? null : runKey
                                    )
                                  }
                                  className="w-full flex items-center py-2 hover:bg-surface/30 transition-colors text-left"
                                >
                                  <span className="w-[60px] pr-3 text-text-muted text-xs">
                                    #{run.run_number}
                                  </span>
                                  <span className="w-[60px] pr-3 text-text-muted text-xs">
                                    img {run.image_index + 1}
                                  </span>
                                  <span className="w-[80px] pr-3">
                                    <StatusBadge status={run.status} />
                                  </span>
                                  <span className="w-[60px] pr-3 text-center text-xs">
                                    {run.exact_match ? (
                                      <span className="text-emerald-400">
                                        &#10003;
                                      </span>
                                    ) : (
                                      <span className="text-red-400">
                                        &#10007;
                                      </span>
                                    )}
                                  </span>
                                  <span className="flex-1 pr-3 text-right text-xs text-text-secondary">
                                    {run.field_accuracy != null
                                      ? `${run.field_accuracy.toFixed(1)}%`
                                      : "-"}
                                  </span>
                                  <span className="w-[80px] pr-3 text-right text-xs text-text-secondary">
                                    {run.response_time_ms != null
                                      ? `${run.response_time_ms}ms`
                                      : "-"}
                                  </span>
                                  <span className="w-[80px] text-right text-xs text-text-secondary">
                                    {run.actual_cost != null
                                      ? `$${run.actual_cost.toFixed(4)}`
                                      : "-"}
                                  </span>
                                </button>

                                {/* Expandable JSON output */}
                                {isRunExpanded && run.output_json && (
                                  <div className="px-4 pb-3">
                                    <pre className="bg-surface text-text-secondary font-mono text-xs p-3 rounded overflow-x-auto max-h-48 overflow-y-auto">
                                      {JSON.stringify(
                                        run.output_json,
                                        null,
                                        2
                                      )}
                                    </pre>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
