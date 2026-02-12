"use client";

import { useMocks } from "@/lib/debug/mock-provider";

/**
 * Debug mock indicator badge.
 * Shows a fixed-position badge in the bottom-left corner when any mock services are active.
 * Renders nothing when no mocks are active.
 */
export function MockIndicator() {
  const mocks = useMocks();

  if (mocks.length === 0) return null;

  return (
    <div className="fixed bottom-3 left-3 z-[9999] flex items-center gap-1.5 rounded-md bg-amber-950/80 border border-amber-700/50 px-2.5 py-1.5 backdrop-blur-sm">
      <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
      <span className="text-[11px] font-mono text-amber-300 uppercase tracking-wide">
        Mock: {mocks.join(", ")}
      </span>
    </div>
  );
}
