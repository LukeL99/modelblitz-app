"use client";

import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter } from "@codemirror/lint";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { AlertTriangle, Wand2, PenLine } from "lucide-react";
import type { SchemaSource } from "@/types/wizard";

interface SchemaReviewProps {
  /** Auto-inferred JSON Schema object */
  inferredSchema: Record<string, unknown> | null;
  /** Compatibility warnings from cross-image checks */
  warnings: string[];
  /** Current schema source mode */
  schemaSource: SchemaSource;
  /** User-provided schema (when in manual mode) */
  userSchema: string;
  /** Called when user changes schema source or provides custom schema */
  onSchemaOverride: (source: SchemaSource, schema: string) => void;
}

export function SchemaReview({
  inferredSchema,
  warnings,
  schemaSource,
  userSchema,
  onSchemaOverride,
}: SchemaReviewProps) {
  const [parseError, setParseError] = useState<string | null>(null);

  const schemaString = inferredSchema
    ? JSON.stringify(inferredSchema, null, 2)
    : "{}";

  const isAuto = schemaSource === "auto";

  const handleToggle = () => {
    if (isAuto) {
      // Switch to manual mode, pre-fill with inferred schema
      onSchemaOverride("manual", userSchema || schemaString);
    } else {
      // Switch back to auto
      onSchemaOverride("auto", "");
    }
  };

  const handleManualChange = (value: string) => {
    onSchemaOverride("manual", value);
    try {
      JSON.parse(value);
      setParseError(null);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  return (
    <div className="space-y-4">
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-400">
                Schema Compatibility Warnings
              </p>
              <ul className="space-y-1">
                {warnings.map((warning, i) => (
                  <li key={i} className="text-xs text-amber-300/80">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Schema header with mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-text-primary">
            Extraction Schema
          </h3>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
              isAuto
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-purple-500/15 text-purple-400"
            }`}
          >
            {isAuto ? (
              <>
                <Wand2 className="w-3 h-3" />
                Auto-detected
              </>
            ) : (
              <>
                <PenLine className="w-3 h-3" />
                Custom schema
              </>
            )}
          </span>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className="text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          {isAuto ? "Use custom schema" : "Use auto-detected schema"}
        </button>
      </div>

      {/* Schema editor */}
      <div className="rounded-xl border border-surface-border overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-surface-border bg-surface-raised">
          <span className="text-xs font-mono text-text-muted">schema.json</span>
          {parseError && (
            <span className="text-xs text-red-400 truncate max-w-[250px]">
              {parseError}
            </span>
          )}
        </div>
        <CodeMirror
          value={isAuto ? schemaString : userSchema}
          onChange={isAuto ? undefined : handleManualChange}
          readOnly={isAuto}
          theme={vscodeDark}
          extensions={
            isAuto
              ? [json()]
              : [json(), linter(jsonParseLinter())]
          }
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            bracketMatching: true,
          }}
          height="200px"
        />
      </div>
    </div>
  );
}
