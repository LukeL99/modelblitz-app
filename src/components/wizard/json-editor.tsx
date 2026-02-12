"use client";

import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { linter, type Diagnostic } from "@codemirror/lint";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import type { EditorView } from "@codemirror/view";
import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";

/** Custom JSON linter that positions errors at the actual problem location */
function jsonLinter() {
  return linter((view: EditorView): Diagnostic[] => {
    const doc = view.state.doc.toString();
    if (!doc.trim()) return [];
    try {
      JSON.parse(doc);
    } catch (e) {
      if (!(e instanceof SyntaxError)) return [];
      let pos = 0;
      const msg = e.message;
      // V8: "... at position 15"
      const posMatch = msg.match(/at position (\d+)/);
      if (posMatch) {
        pos = Math.min(+posMatch[1], doc.length);
      } else {
        // Firefox: "... at line 2 column 5"
        const lineMatch = msg.match(/at line (\d+) column (\d+)/);
        if (lineMatch) {
          const line = view.state.doc.line(+lineMatch[1]);
          pos = Math.min(line.from + (+lineMatch[2]) - 1, doc.length);
        }
      }
      // Create a visible range: extend to next word boundary or at least 1 char
      let to = pos;
      if (pos < doc.length) {
        to = pos + 1;
        // Extend to end of the problematic token
        while (to < doc.length && /\S/.test(doc[to]) && !/[,\]}\n]/.test(doc[to])) {
          to++;
        }
      }
      return [{ from: pos, to: Math.max(to, pos + 1), message: msg, severity: "error" }];
    }
    return [];
  });
}

interface JsonEditorProps {
  value: string;
  onChange: (value: string, isValid: boolean, parsed: unknown) => void;
}

export function JsonEditor({ value, onChange }: JsonEditorProps) {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (val: string) => {
      if (!val.trim()) {
        setError(null);
        onChange(val, false, null);
        return;
      }
      try {
        const parsed = JSON.parse(val);
        setError(null);
        onChange(val, true, parsed);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Invalid JSON";
        setError(msg);
        onChange(val, false, null);
      }
    },
    [onChange]
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        handleChange(content);
      };
      reader.readAsText(file);

      // Reset input so the same file can be re-uploaded
      e.target.value = "";
    },
    [handleChange]
  );

  return (
    <div className="rounded-xl border border-surface-border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-surface-border bg-surface-raised">
        <span className="text-xs font-mono text-text-muted">
          expected_output.json
        </span>
        <div className="flex items-center gap-2">
          {error && (
            <span className="text-xs text-red-400 truncate max-w-[200px]">
              {error}
            </span>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            <Upload className="w-3 h-3" />
            Upload .json
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
      <CodeMirror
        value={value}
        onChange={handleChange}
        theme={vscodeDark}
        extensions={[json(), jsonLinter()]}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          bracketMatching: true,
        }}
        height="300px"
      />
    </div>
  );
}
