"use client";

import { useState } from "react";
import type { ModelSummary, ErrorPattern } from "@/types/report";

interface FieldError {
  fieldPath: string;
  expected: string;
  actual: string;
}

interface RunErrorData {
  field_errors: FieldError[];
  exact_match: boolean;
}

interface ErrorAnalysisProps {
  models: ModelSummary[];
  errorPatterns: ErrorPattern[];
  runsByModel: Record<string, RunErrorData[]>;
}

export function ErrorAnalysis({
  models,
  errorPatterns,
  runsByModel,
}: ErrorAnalysisProps) {
  const [showAllPatterns, setShowAllPatterns] = useState(false);

  const visiblePatterns = showAllPatterns
    ? errorPatterns
    : errorPatterns.slice(0, 15);
  const hiddenCount = errorPatterns.length - 15;

  return (
    <div className="space-y-8">
      {/* Section 1: Aggregated Error Patterns */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Common Error Patterns
        </h3>

        {errorPatterns.length === 0 ? (
          <div className="bg-surface-raised rounded-xl p-6 border border-surface-border text-center">
            <span className="text-2xl">&#10003;</span>
            <p className="text-emerald-400 font-medium mt-2">
              All models achieved perfect field extraction!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visiblePatterns.map((pattern, idx) => (
              <div
                key={`${pattern.modelId}-${pattern.fieldPath}-${idx}`}
                className="bg-surface-raised rounded-lg p-4 border border-surface-border"
              >
                <p className="text-sm text-text-primary">
                  <span className="font-medium">{pattern.modelName}</span>{" "}
                  misses{" "}
                  <code className="text-xs bg-surface px-1.5 py-0.5 rounded font-mono text-amber-400">
                    {pattern.fieldPath}
                  </code>{" "}
                  <span className="text-text-muted">
                    {pattern.percentage}% of the time
                  </span>
                </p>

                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded font-mono">
                    Expected: {pattern.commonExpected || '""'}
                  </span>
                  <span className="text-text-muted">-&gt;</span>
                  <span className="text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded font-mono">
                    Actual: {pattern.commonActual || '""'}
                  </span>
                </div>

                <p className="text-xs text-text-muted mt-1">
                  {pattern.occurrences}/{pattern.totalRuns} runs
                </p>
              </div>
            ))}

            {!showAllPatterns && hiddenCount > 0 && (
              <button
                onClick={() => setShowAllPatterns(true)}
                className="text-sm text-ember hover:underline"
              >
                and {hiddenCount} more patterns...
              </button>
            )}
          </div>
        )}
      </div>

      {/* Section 2: Per-model field diffs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Per-Model Field Errors
        </h3>

        {models.map((model) => {
          const runs = runsByModel[model.modelId] ?? [];
          // Aggregate field errors for this model from its runs
          const errorMap = new Map<
            string,
            {
              fieldPath: string;
              expected: string;
              actual: string;
              occurrences: number;
            }
          >();

          for (const run of runs) {
            if (!Array.isArray(run.field_errors)) continue;
            for (const err of run.field_errors) {
              if (!err.fieldPath) continue;
              const key = `${err.fieldPath}|${String(err.expected)}|${String(err.actual)}`;
              const existing = errorMap.get(key);
              if (existing) {
                existing.occurrences++;
              } else {
                errorMap.set(key, {
                  fieldPath: err.fieldPath,
                  expected: String(err.expected ?? ""),
                  actual: String(err.actual ?? ""),
                  occurrences: 1,
                });
              }
            }
          }

          const fieldErrors = Array.from(errorMap.values()).sort(
            (a, b) => b.occurrences - a.occurrences
          );

          return (
            <details
              key={model.modelId}
              className="bg-surface-raised rounded-xl border border-surface-border"
            >
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-surface/50 transition-colors rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-text-primary text-sm">
                    {model.modelName}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-surface text-text-muted">
                    {model.accuracy.toFixed(1)}% accuracy
                  </span>
                </div>
                <span className="text-xs text-text-muted">
                  {fieldErrors.length} error types
                </span>
              </summary>

              <div className="px-5 pb-4">
                {fieldErrors.length === 0 ? (
                  <p className="text-sm text-text-muted py-2">
                    No field errors recorded for this model.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-surface-border">
                          <th className="text-left py-2 pr-4 text-text-muted font-medium text-xs">
                            Field Path
                          </th>
                          <th className="text-left py-2 pr-4 text-text-muted font-medium text-xs">
                            Expected
                          </th>
                          <th className="text-left py-2 pr-4 text-text-muted font-medium text-xs">
                            Actual
                          </th>
                          <th className="text-right py-2 text-text-muted font-medium text-xs">
                            Occurrences
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {fieldErrors.map((err, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-surface-border/50 last:border-0"
                          >
                            <td className="py-2 pr-4">
                              <code className="text-xs font-mono text-amber-400">
                                {err.fieldPath}
                              </code>
                            </td>
                            <td className="py-2 pr-4">
                              {err.expected ? (
                                <span className="text-green-400 bg-green-400/10 px-1 rounded font-mono text-xs">
                                  {err.expected}
                                </span>
                              ) : (
                                <span className="text-amber-400 bg-amber-400/10 px-1 rounded font-mono text-xs">
                                  EXTRA
                                </span>
                              )}
                            </td>
                            <td className="py-2 pr-4">
                              {err.actual ? (
                                <span className="text-red-400 bg-red-400/10 px-1 rounded font-mono text-xs">
                                  {err.actual}
                                </span>
                              ) : (
                                <span className="text-red-400 bg-red-400/10 px-1 rounded font-mono text-xs font-semibold">
                                  MISSING
                                </span>
                              )}
                            </td>
                            <td className="py-2 text-right text-text-muted text-xs">
                              {err.occurrences}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
