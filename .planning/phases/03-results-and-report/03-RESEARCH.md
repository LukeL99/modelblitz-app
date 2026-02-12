# Phase 3: Results and Report - Research

**Researched:** 2026-02-12
**Domain:** Supabase Realtime progress delivery, report visualization (SVG charts), field-level error diffs, PDF export, shareable links, cost calculator, email notification
**Confidence:** HIGH

## Summary

Phase 3 delivers the user-facing output of a benchmark: real-time progress during execution, and a comprehensive report page when complete. The scope covers five technical domains: (1) real-time progress using Supabase Realtime `postgres_changes` subscriptions on the `benchmark_runs` table, with auto-reconnect handling via channel status callbacks; (2) a report page with ranked table, recommendation card, and error analysis -- all rendered as standard React server and client components using the existing Tailwind v4 dark-warm palette; (3) three custom inline SVG chart components (bubble chart, P95 bar chart, cost bar chart) since Recharts ScatterChart is broken in this stack; (4) a client-side PDF export using `html2pdf.js` which rasterizes the report DOM to PDF; and (5) shareable links via the existing `share_token` column on reports (already generated in Phase 2 webhook) with a public `/report/[token]` route that bypasses auth.

The database schema already has everything needed -- `reports` with `share_token` and `benchmark_runs` with per-run field-level data. The engine already calculates aggregates, records field_errors, and stores a recommended_model. The email is already sent on completion (Phase 2). The remaining work is entirely frontend: converting the raw `benchmark_runs` data into a polished, interactive report experience.

**Primary recommendation:** Build the report as a Next.js server component page at `/report/[token]` that loads all data server-side, with client component islands for interactivity (sorting, tab switching, chart tooltips, PDF export). Use Supabase Realtime `postgres_changes` subscriptions in the processing page to show live progress as benchmark_runs INSERT. Build charts as inline SVG React components with no charting library. Use `html2pdf.js` for client-side PDF export. For RPT-09 (OpenRouter baseline comparison), use model pricing data from the curated models list as the comparison baseline since OpenRouter does not expose per-model latency stats via API.

## Standard Stack

### Core (Phase 3 additions to existing stack)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| html2pdf.js | ^0.10.x | Client-side PDF export from report DOM | 5M+ downloads. Wraps html2canvas + jsPDF. No server dependency. Works with dark-theme CSS. |

### Supporting (already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @supabase/supabase-js | ^2.95.x | Realtime subscriptions for live progress | Already installed. Use browser client for channel subscriptions. |
| lucide-react | ^0.563.x | Icons for report UI (trophy, sort arrows, expand, etc.) | Already installed. Consistent icon set across the app. |
| nanoid | ^5.1.x | Already used for share tokens in Phase 2 | No new usage needed -- share_token already generated. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| html2pdf.js | react-to-pdf | react-to-pdf wraps the same html2canvas + jsPDF. html2pdf.js has a simpler imperative API: `html2pdf().from(element).save()`. react-to-pdf adds a ref-based hook that is unnecessary when we already have the DOM element. |
| html2pdf.js | @react-pdf/renderer | @react-pdf/renderer generates PDFs from a custom React-PDF component tree (not from HTML). Would require rebuilding the entire report layout in a parallel React-PDF format. Massive duplication. |
| html2pdf.js | Server-side Puppeteer/Playwright PDF | Requires a headless browser on the server. Complex deployment on Vercel. Client-side is simpler for MVP and avoids server resource consumption. |
| Custom SVG charts | Recharts | PROJECT.md explicitly states "Recharts ScatterChart is broken in this stack." Custom inline SVG is more reliable and gives full control over the dark-warm palette styling. |
| Custom SVG charts | visx (Airbnb) | visx is tree-shakable D3 primitives for React. Viable option, but adds a dependency for 3 simple charts. Custom SVG is ~100 lines per chart with zero dependencies. |
| Custom SVG charts | Chart.js/react-chartjs-2 | Canvas-based, not SVG. Harder to style with Tailwind. Dark theme requires manual configuration. Overkill for 3 charts. |
| Supabase Realtime | Polling | Polling adds unnecessary load and delay. Supabase Realtime is already in the stack (decided in init phase) and provides sub-second updates. |

**Installation:**
```bash
npm install html2pdf.js
```

Note: html2pdf.js is browser-only and must be dynamically imported in client components.

## Architecture Patterns

### Recommended Project Structure (Phase 3 additions)
```
src/
├── app/
│   ├── (app)/
│   │   └── benchmark/
│   │       └── [id]/
│   │           └── processing/
│   │               └── page.tsx          # MODIFY: Add Realtime progress client island
│   └── report/
│       └── [token]/
│           └── page.tsx                  # NEW: Public shareable report page (server component)
├── components/
│   ├── report/
│   │   ├── report-header.tsx             # Report title, metadata, share/export buttons
│   │   ├── recommendation-card.tsx       # RPT-02: Top model recommendation with rationale
│   │   ├── ranked-table.tsx              # RPT-01: Sortable results table (client component)
│   │   ├── bubble-chart.tsx              # RPT-03: Cost vs accuracy SVG bubble chart
│   │   ├── latency-chart.tsx             # RPT-04: P95 latency bar chart
│   │   ├── cost-chart.tsx                # RPT-05: Cost per run bar chart
│   │   ├── error-analysis.tsx            # RPT-06/07: Field-level diffs + error patterns
│   │   ├── cost-calculator.tsx           # RPT-08: Volume slider + model comparison
│   │   ├── raw-runs.tsx                  # RPT-10: Expandable per-model run data
│   │   ├── pdf-export-button.tsx         # RPT-12: PDF export trigger (client component)
│   │   └── share-button.tsx              # RPT-11: Copy shareable link button
│   └── benchmark/
│       └── live-progress.tsx             # LIVE-01/02/03: Realtime progress panel (client)
├── lib/
│   └── report/
│       ├── aggregate.ts                  # Transform raw runs into report view models
│       ├── recommendation.ts             # Generate recommendation rationale text
│       └── error-patterns.ts             # Aggregate field errors into patterns
└── types/
    └── report.ts                         # Report-specific view model types
```

### Pattern 1: Supabase Realtime Live Progress (LIVE-01, LIVE-02, LIVE-03)
**What:** Client component subscribes to `postgres_changes` on `benchmark_runs` table filtered by `report_id`. Each INSERT or UPDATE event updates a local state map of model progress.
**When to use:** Processing page while benchmark is running.
**Confidence:** HIGH (Supabase Realtime docs, verified API)

```typescript
// components/benchmark/live-progress.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BenchmarkRun, BenchmarkRunStatus } from "@/types/database";

interface ModelProgress {
  modelId: string;
  modelName: string;
  completed: number;
  total: number;
  accuracy: number;
  status: "pending" | "running" | "complete";
}

interface LiveProgressProps {
  reportId: string;
  selectedModels: string[];
  totalRunsPerModel: number;
}

export function LiveProgress({ reportId, selectedModels, totalRunsPerModel }: LiveProgressProps) {
  const [progress, setProgress] = useState<Map<string, ModelProgress>>(new Map());
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`report-progress-${reportId}`)
      .on(
        "postgres_changes",
        {
          event: "*",          // Listen for INSERT and UPDATE
          schema: "public",
          table: "benchmark_runs",
          filter: `report_id=eq.${reportId}`,
        },
        (payload) => {
          const run = payload.new as BenchmarkRun;
          if (!run || !run.model_id) return;

          setProgress((prev) => {
            const next = new Map(prev);
            const existing = next.get(run.model_id) ?? {
              modelId: run.model_id,
              modelName: run.model_id,
              completed: 0,
              total: totalRunsPerModel,
              accuracy: 0,
              status: "pending" as const,
            };

            // Recalculate from accumulated data
            if (run.status === "complete") {
              existing.completed++;
              // Recalculate running accuracy would need all runs
              // Simpler: show completion count
            }

            if (existing.completed >= existing.total) {
              existing.status = "complete";
            } else if (existing.completed > 0) {
              existing.status = "running";
            }

            next.set(run.model_id, existing);
            return next;
          });
        }
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reportId, totalRunsPerModel]);

  // Render progress UI...
}
```

### Pattern 2: Server-Side Report Data Loading
**What:** The report page loads all data server-side using the Supabase server client. The `share_token` in the URL allows unauthenticated access via RLS policy (already configured in migration 001). Data is transformed into view models before passing to client components.
**When to use:** Report page at `/report/[token]`.
**Confidence:** HIGH (standard Next.js App Router pattern, RLS already configured)

```typescript
// app/report/[token]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { transformRunsToReport } from "@/lib/report/aggregate";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  // RLS "Anyone can view shared reports" policy allows anon access via share_token
  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("share_token", token)
    .single();

  if (!report || report.status !== "complete") {
    notFound();
  }

  // Load all benchmark runs for this report
  const { data: runs } = await supabase
    .from("benchmark_runs")
    .select("*")
    .eq("report_id", report.id)
    .order("model_id", { ascending: true });

  // Transform raw data into report view models
  const reportData = transformRunsToReport(report, runs ?? []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Server components for static content */}
      {/* Client component islands for interactive parts */}
    </div>
  );
}
```

### Pattern 3: Custom Inline SVG Bubble Chart (RPT-03)
**What:** A React component that renders an SVG scatter/bubble chart with CSS-styled circles. X-axis = cost, Y-axis = accuracy, circle size = P95 latency, opacity = consistency (1 - spread). Uses the existing Tailwind palette.
**When to use:** RPT-03 visualization.
**Confidence:** HIGH (standard SVG in React, no external dependencies)

```typescript
// components/report/bubble-chart.tsx
"use client";

interface BubbleDataPoint {
  modelName: string;
  cost: number;      // x-axis
  accuracy: number;  // y-axis (0-100)
  p95: number;       // circle size
  spread: number;    // opacity (lower spread = more opaque = more consistent)
  color: string;     // provider color
}

interface BubbleChartProps {
  data: BubbleDataPoint[];
  width?: number;
  height?: number;
}

export function BubbleChart({ data, width = 600, height = 400 }: BubbleChartProps) {
  const padding = { top: 20, right: 40, bottom: 50, left: 60 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Scale functions
  const maxCost = Math.max(...data.map(d => d.cost), 0.001);
  const maxP95 = Math.max(...data.map(d => d.p95), 100);

  const scaleX = (cost: number) => (cost / maxCost) * plotWidth;
  const scaleY = (accuracy: number) => plotHeight - (accuracy / 100) * plotHeight;
  const scaleR = (p95: number) => 8 + (p95 / maxP95) * 24; // 8-32px radius
  const scaleOpacity = (spread: number) => Math.max(0.3, 1 - spread / 50);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <g transform={`translate(${padding.left}, ${padding.top})`}>
        {/* Grid lines, axes, labels */}
        {/* Data circles */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={scaleX(d.cost)}
            cy={scaleY(d.accuracy)}
            r={scaleR(d.p95)}
            fill={d.color}
            fillOpacity={scaleOpacity(d.spread)}
            stroke={d.color}
            strokeWidth={1.5}
            className="transition-all duration-200 hover:stroke-2"
          />
        ))}
      </g>
    </svg>
  );
}
```

### Pattern 4: Client-Side PDF Export (RPT-12)
**What:** A client component button that dynamically imports `html2pdf.js` and generates a PDF from a target DOM element. Must handle the dynamic import since html2pdf.js is browser-only.
**When to use:** RPT-12 PDF export.
**Confidence:** HIGH (html2pdf.js docs, verified browser-only constraint)

```typescript
// components/report/pdf-export-button.tsx
"use client";

import { useCallback, useState } from "react";

interface PdfExportButtonProps {
  targetId: string;  // DOM element ID to capture
  filename?: string;
}

export function PdfExportButton({ targetId, filename = "benchmark-report.pdf" }: PdfExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      // Dynamic import -- html2pdf.js is browser-only
      const html2pdf = (await import("html2pdf.js")).default;

      const element = document.getElementById(targetId);
      if (!element) return;

      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#0A0A0B", // Match void background
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        })
        .from(element)
        .save();
    } finally {
      setExporting(false);
    }
  }, [targetId, filename]);

  return (
    <button onClick={handleExport} disabled={exporting}>
      {exporting ? "Exporting..." : "Export PDF"}
    </button>
  );
}
```

### Pattern 5: Shareable Report Route (RPT-11)
**What:** The report page uses `share_token` as the URL parameter, not `report.id`. This allows unauthenticated access because the RLS policy "Anyone can view shared reports" allows SELECT when `share_token IS NOT NULL`. No login required.
**When to use:** RPT-11 shareable link.
**Confidence:** HIGH (RLS already configured in migration 001, share_token already generated in Phase 2 webhook)

The route structure is `/report/[token]` where `token` is the share_token. The existing RLS policies already handle this:
- `"Anyone can view shared reports"` on `reports` table (migration 001, lines 97-99)
- `"Users can view runs for own reports"` on `benchmark_runs` (migration 003) -- but this only covers authenticated users

**IMPORTANT:** A new RLS policy is needed for `benchmark_runs` to allow anonymous access when the parent report has a share_token. This was already sketched in the Phase 2 research (Pattern 8 migration) but was not included in the actual migration 003. The policy should be:

```sql
CREATE POLICY "Anyone can view runs for shared reports"
  ON benchmark_runs FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reports
      WHERE reports.id = benchmark_runs.report_id
      AND reports.share_token IS NOT NULL
    )
  );
```

### Pattern 6: Aggregate Data Transformation
**What:** A pure function that transforms raw `benchmark_runs` rows into the view model structure needed by report components. Groups runs by model, calculates per-model aggregates, and builds the ranked table data.
**When to use:** Server-side data preparation before rendering report.
**Confidence:** HIGH (engine.ts already does similar aggregation in Step 5, this is the read-side equivalent)

```typescript
// lib/report/aggregate.ts
import type { BenchmarkRun, Report } from "@/types/database";
import { getModelById } from "@/lib/config/models";

export interface ModelSummary {
  modelId: string;
  modelName: string;
  provider: string;
  tier: string;
  accuracy: number;          // avg field_accuracy (0-100)
  exactMatchRate: number;    // % of runs with exact_match
  costPerRun: number;        // avg actual_cost
  medianLatency: number;     // median response_time_ms
  p95Latency: number;        // 95th percentile response_time_ms
  spread: number;            // std dev of field_accuracy
  runsCompleted: number;
  runsAttempted: number;
  fieldErrors: FieldErrorSummary[];
  rawRuns: BenchmarkRun[];
}

export interface FieldErrorSummary {
  fieldPath: string;
  expected: string;
  actual: string;
  occurrences: number;
  percentage: number;        // occurrences / total runs * 100
}

export function transformRunsToReport(
  report: Report,
  runs: BenchmarkRun[]
): {
  models: ModelSummary[];
  recommendedModelId: string | null;
  totalApiCost: number;
} {
  // Group runs by model_id
  const byModel = new Map<string, BenchmarkRun[]>();
  for (const run of runs) {
    const existing = byModel.get(run.model_id) ?? [];
    existing.push(run);
    byModel.set(run.model_id, existing);
  }

  const models: ModelSummary[] = [];
  for (const [modelId, modelRuns] of byModel) {
    const info = getModelById(modelId);
    const completed = modelRuns.filter(r => r.status === "complete");

    // Calculate aggregates (same logic as engine.ts Step 5)
    // ... accuracy, latency, cost, spread, field errors
    models.push({
      modelId,
      modelName: info?.name ?? modelId,
      provider: info?.provider ?? "unknown",
      tier: info?.tier ?? "unknown",
      // ... calculated values
      rawRuns: modelRuns,
    });
  }

  // Sort by accuracy descending by default
  models.sort((a, b) => b.accuracy - a.accuracy);

  return {
    models,
    recommendedModelId: report.recommended_model,
    totalApiCost: report.total_api_cost ?? 0,
  };
}
```

### Pattern 7: Error Pattern Aggregation (RPT-07)
**What:** Aggregate per-run field_errors across all runs for a model into patterns like "Claude Haiku misses tax field 30%". Group by (modelId, fieldPath), count occurrences, calculate frequency.
**When to use:** RPT-07 error pattern analysis.
**Confidence:** HIGH (straightforward grouping of existing field_errors data)

```typescript
// lib/report/error-patterns.ts
export interface ErrorPattern {
  modelName: string;
  fieldPath: string;
  occurrences: number;
  totalRuns: number;
  percentage: number;
  commonActual: string;  // most frequent incorrect value
}

export function aggregateErrorPatterns(
  modelRuns: BenchmarkRun[],
  modelName: string
): ErrorPattern[] {
  const completed = modelRuns.filter(r => r.status === "complete");
  const totalRuns = completed.length;

  // Count occurrences of each field path error
  const errorCounts = new Map<string, { count: number; actuals: Map<string, number> }>();

  for (const run of completed) {
    const errors = (run.field_errors ?? []) as Array<{
      fieldPath: string;
      expected: string;
      actual: string;
    }>;
    for (const err of errors) {
      const existing = errorCounts.get(err.fieldPath) ?? { count: 0, actuals: new Map() };
      existing.count++;
      existing.actuals.set(err.actual, (existing.actuals.get(err.actual) ?? 0) + 1);
      errorCounts.set(err.fieldPath, existing);
    }
  }

  return Array.from(errorCounts.entries())
    .map(([fieldPath, data]) => {
      // Find most common incorrect value
      let maxActual = "";
      let maxCount = 0;
      for (const [actual, count] of data.actuals) {
        if (count > maxCount) {
          maxActual = actual;
          maxCount = count;
        }
      }

      return {
        modelName,
        fieldPath,
        occurrences: data.count,
        totalRuns,
        percentage: Math.round((data.count / totalRuns) * 100),
        commonActual: maxActual,
      };
    })
    .sort((a, b) => b.occurrences - a.occurrences);
}
```

### Anti-Patterns to Avoid
- **Anti-pattern: Loading report data client-side via API route.** The report page should load data server-side in the page component. Client-side fetching adds a loading spinner, hurts SEO for shareable links, and doubles the data transfer. Server components can query Supabase directly.
- **Anti-pattern: Using Recharts for bubble chart.** PROJECT.md explicitly states "Recharts ScatterChart is broken in this stack." Use inline SVG components instead.
- **Anti-pattern: Subscribing to Realtime on the full `benchmark_runs` table without a filter.** Always filter by `report_id=eq.${reportId}` to receive only relevant events. Without the filter, the client receives events from all reports.
- **Anti-pattern: Generating PDF server-side with Puppeteer on Vercel.** Puppeteer requires a headless browser binary. Vercel's serverless environment makes this complex and slow. Client-side html2pdf.js is simpler and works within the user's browser.
- **Anti-pattern: Building the shareable link with `report.id` instead of `share_token`.** UUIDs are guessable in sequence. The `share_token` is a random nanoid(22) that provides security through obscurity. Also, using `share_token` enables the RLS policy for anonymous access.
- **Anti-pattern: Not enabling Realtime replication on the `benchmark_runs` table.** Supabase Realtime requires tables to be added to the `supabase_realtime` publication. This must be done via SQL or the Supabase dashboard. Without it, no postgres_changes events will fire.
- **Anti-pattern: Putting heavy aggregation logic in client components.** Calculate all aggregates (accuracy, latency percentiles, error patterns, recommendation rationale) server-side in the page component or in `lib/report/` utilities. Pass pre-computed data to client components for display.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF generation | Custom canvas-to-PDF pipeline | html2pdf.js | Handles page breaks, image embedding, dark backgrounds, CSS styles. ~5 lines of code to generate a PDF. |
| Realtime subscriptions | Custom WebSocket connection | Supabase Realtime `postgres_changes` | Already in the stack. Handles reconnection, heartbeats, auth token refresh. |
| Percentile calculations | Full statistics library | Simple sorted-array P95 | For P95: sort array, take element at index `ceil(0.95 * length) - 1`. No need for a stats library. |
| Copy-to-clipboard | Custom clipboard API wrapper | `navigator.clipboard.writeText()` | Native browser API. One line. Falls back gracefully. |
| Sortable table | Custom sort state management | Simple `useState` + `Array.sort()` | The table has ~5-25 rows. No need for a table library. useState for sortColumn + sortDirection, sort the array before render. |

**Key insight:** Phase 3 is primarily a frontend rendering phase. The data is already in the database from Phase 2. The work is transforming raw benchmark_runs rows into polished UI components. Avoid adding heavy dependencies -- the data volumes are small (5-25 models, ~50-750 runs) and can be handled with simple array operations.

## Common Pitfalls

### Pitfall 1: Supabase Realtime Not Receiving Events
**What goes wrong:** The processing page subscribes to benchmark_runs changes but never receives events. The benchmark completes but the UI stays stuck on "running."
**Why it happens:** The `benchmark_runs` table is not added to the `supabase_realtime` publication. Supabase Realtime only broadcasts changes for tables in this publication.
**How to avoid:** Add a migration or setup instruction:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE benchmark_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE reports;
```
Also enable `REPLICA IDENTITY FULL` on benchmark_runs if you need the old row values on UPDATE events.
**Warning signs:** Channel status shows SUBSCRIBED but no events arrive. Dashboard Realtime inspector shows no messages.

### Pitfall 2: html2pdf.js Produces Blank or Unstyled PDF
**What goes wrong:** The exported PDF is blank, has a white background instead of the dark theme, or cuts off content mid-element.
**Why it happens:** html2canvas captures the rendered DOM but may not capture CSS custom properties, Tailwind utility classes correctly, or off-screen elements. The dark background must be explicitly set via `html2canvas.backgroundColor`.
**How to avoid:** (1) Set `html2canvas: { backgroundColor: "#0A0A0B" }` in html2pdf options. (2) Set `scale: 2` for retina quality. (3) Use `pagebreak: { mode: ["avoid-all", "css", "legacy"] }` to prevent mid-element page breaks. (4) Add `html2pdf__page-break` CSS classes to section boundaries. (5) Test with a visible element (not `display: none`).
**Warning signs:** PDF is pure white. PDF cuts off table rows. SVG charts are missing from the PDF.

### Pitfall 3: Realtime Subscription Memory Leak on Navigation
**What goes wrong:** User navigates away from the processing page, but the Realtime channel subscription stays open. Multiple navigations create multiple zombie channels.
**Why it happens:** Missing cleanup in useEffect. React strict mode in development calls useEffect twice, which can double-subscribe without proper cleanup.
**How to avoid:** Always call `supabase.removeChannel(channel)` in the useEffect cleanup function. Use a channel name unique to the reportId to avoid conflicts.
**Warning signs:** Console warnings about duplicate channels. Memory usage climbing during development with hot reload.

### Pitfall 4: SVG Charts Not Rendering in PDF Export
**What goes wrong:** The report looks correct in the browser but the PDF export shows blank spaces where SVG charts were.
**Why it happens:** html2canvas has limited SVG support. Complex SVG features (foreignObject, CSS transforms, clip-path) may not render correctly.
**How to avoid:** (1) Keep SVG charts simple -- basic elements only (circle, rect, line, text, g). (2) Avoid foreignObject for HTML-in-SVG. (3) Use inline styles or SVG attributes instead of CSS classes inside SVG elements for PDF compatibility. (4) Test PDF export early and adjust chart implementations as needed.
**Warning signs:** Charts visible in browser but blank in PDF. Text labels missing in exported PDF.

### Pitfall 5: Share Link Exposes Benchmark Runs Without RLS Policy
**What goes wrong:** Anonymous users visit `/report/[token]`, the report loads (via the existing anon RLS policy), but benchmark_runs fail to load because there's no anon RLS policy for benchmark_runs.
**Why it happens:** Migration 003 only created an authenticated-user SELECT policy for benchmark_runs. The Phase 2 research included an anon policy in its example migration but it was not actually implemented.
**How to avoid:** Add a new migration with the anon SELECT policy for benchmark_runs:
```sql
CREATE POLICY "Anyone can view runs for shared reports"
  ON benchmark_runs FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reports
      WHERE reports.id = benchmark_runs.report_id
      AND reports.share_token IS NOT NULL
    )
  );
```
**Warning signs:** Report page loads for the owner but shows "no data" for anonymous visitors. Supabase logs show RLS violations on benchmark_runs.

### Pitfall 6: Cost Calculator Slider Causes Excessive Re-renders
**What goes wrong:** The daily volume slider in the cost calculator triggers a re-render of the entire report page on every slider position change.
**Why it happens:** Slider onChange fires on every pixel of mouse movement. If the cost calculator state is lifted to the report page level, every change re-renders all components.
**How to avoid:** Keep the cost calculator state entirely local to the CostCalculator component. Use `useState` within the component, not in a parent. The calculator's state (volume, comparison model) doesn't affect any other component.
**Warning signs:** Laggy slider movement. Browser dev tools show full page re-renders on slider drag.

### Pitfall 7: Report Page Slow Due to Large Raw Runs Dataset
**What goes wrong:** With 25 models x 10 images x 3 runs = 750 rows, serializing all raw run data (including output_json blobs) to client components causes slow page load.
**Why it happens:** Each benchmark_run has an output_json field that can be several KB. 750 runs with full JSON output is significant serialized payload.
**How to avoid:** (1) Only pass aggregated data to the main report components. (2) For the raw runs expandable section (RPT-10), either lazy-load per-model runs on expand, or strip output_json from the initial load and fetch it on demand. (3) Consider a separate API route `/api/report/[id]/runs/[modelId]` for lazy-loading raw runs.
**Warning signs:** Report page takes 3+ seconds to load. Next.js serialization warnings about large page props.

## Code Examples

### Supabase Realtime Subscription with Auto-Reconnect
```typescript
// Source: Supabase docs - postgres-changes + reconnection handling
"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

function useRealtimeRuns(reportId: string, onRun: (run: unknown) => void) {
  const [status, setStatus] = useState<string>("connecting");
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`benchmark-${reportId}`, {
        config: { broadcast: { self: true } },
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "benchmark_runs",
          filter: `report_id=eq.${reportId}`,
        },
        (payload) => {
          onRun(payload.new);
        }
      )
      .subscribe((status) => {
        setStatus(status);
        // Supabase client handles reconnection automatically
        // with exponential backoff (1s, 2s, 5s, 10s)
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reportId, onRun]);

  return { status };
}
```

### Enable Realtime Replication (Migration)
```sql
-- supabase/migrations/004_realtime_and_shared_runs.sql

-- Enable Realtime for benchmark_runs and reports tables
ALTER PUBLICATION supabase_realtime ADD TABLE benchmark_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE reports;

-- Allow anonymous users to view benchmark runs for shared reports
CREATE POLICY "Anyone can view runs for shared reports"
  ON benchmark_runs FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reports
      WHERE reports.id = benchmark_runs.report_id
      AND reports.share_token IS NOT NULL
    )
  );
```

### Sortable Table State Pattern
```typescript
// components/report/ranked-table.tsx
"use client";

import { useState, useMemo } from "react";
import type { ModelSummary } from "@/lib/report/aggregate";

type SortKey = "accuracy" | "costPerRun" | "medianLatency" | "p95Latency" | "spread";

export function RankedTable({ models }: { models: ModelSummary[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("accuracy");
  const [sortDesc, setSortDesc] = useState(true);

  const sorted = useMemo(() => {
    const copy = [...models];
    copy.sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      return sortDesc ? bVal - aVal : aVal - bVal;
    });
    return copy;
  }, [models, sortKey, sortDesc]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      // Higher is better for accuracy; lower is better for cost/latency
      setSortDesc(key === "accuracy");
    }
  };

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-surface-border text-text-muted">
          <th className="text-left py-3 px-4">Rank</th>
          <th className="text-left py-3 px-4">Model</th>
          <th className="text-right py-3 px-4 cursor-pointer" onClick={() => handleSort("accuracy")}>
            Accuracy {sortKey === "accuracy" ? (sortDesc ? "↓" : "↑") : ""}
          </th>
          {/* ... more sortable columns */}
        </tr>
      </thead>
      <tbody>
        {sorted.map((model, i) => (
          <tr key={model.modelId} className="border-b border-surface-border/50 hover:bg-surface-raised/50">
            <td className="py-3 px-4 text-text-muted">{i + 1}</td>
            <td className="py-3 px-4 font-medium text-text-primary">{model.modelName}</td>
            <td className="py-3 px-4 text-right tabular-nums">{model.accuracy}%</td>
            {/* ... */}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Cost Calculator with Volume Slider (RPT-08)
```typescript
// components/report/cost-calculator.tsx
"use client";

import { useState, useMemo } from "react";
import type { ModelSummary } from "@/lib/report/aggregate";

interface CostCalculatorProps {
  models: ModelSummary[];
  recommendedModelId: string | null;
}

export function CostCalculator({ models, recommendedModelId }: CostCalculatorProps) {
  const [dailyVolume, setDailyVolume] = useState(100);
  const [comparisonModelId, setComparisonModelId] = useState<string>(
    // Default to most expensive model for dramatic savings callout
    models.reduce((a, b) => (a.costPerRun > b.costPerRun ? a : b))?.modelId ?? ""
  );

  const recommended = models.find(m => m.modelId === recommendedModelId);
  const comparison = models.find(m => m.modelId === comparisonModelId);

  const monthlyCostRecommended = (recommended?.costPerRun ?? 0) * dailyVolume * 30;
  const monthlyCostComparison = (comparison?.costPerRun ?? 0) * dailyVolume * 30;
  const monthlySavings = monthlyCostComparison - monthlyCostRecommended;

  return (
    <div className="space-y-4">
      <label className="text-sm text-text-secondary">
        Daily API calls: <span className="text-text-primary font-mono">{dailyVolume}</span>
      </label>
      <input
        type="range"
        min={10}
        max={10000}
        step={10}
        value={dailyVolume}
        onChange={(e) => setDailyVolume(Number(e.target.value))}
        className="w-full accent-ember"
      />
      {/* Comparison dropdown, cost cards, savings callout */}
    </div>
  );
}
```

### Recommendation Rationale Generation (RPT-02)
```typescript
// lib/report/recommendation.ts
import type { ModelSummary } from "./aggregate";
import { getModelById } from "@/lib/config/models";

export function generateRationale(
  recommended: ModelSummary,
  allModels: ModelSummary[],
  priorities: string[]
): string {
  const parts: string[] = [];

  // Primary metric based on top priority
  const topPriority = priorities[0] ?? "accuracy";
  switch (topPriority) {
    case "accuracy":
      parts.push(`${recommended.modelName} achieved ${recommended.accuracy}% field accuracy`);
      break;
    case "speed":
      parts.push(`${recommended.modelName} responded in ${recommended.medianLatency}ms median`);
      break;
    case "cost":
      parts.push(`${recommended.modelName} costs $${recommended.costPerRun.toFixed(4)}/call`);
      break;
  }

  // Savings comparison against most expensive model tested
  const mostExpensive = allModels.reduce((a, b) =>
    a.costPerRun > b.costPerRun ? a : b
  );
  if (mostExpensive.modelId !== recommended.modelId && mostExpensive.costPerRun > 0) {
    const savingsPercent = Math.round(
      (1 - recommended.costPerRun / mostExpensive.costPerRun) * 100
    );
    if (savingsPercent > 10) {
      parts.push(`saving ${savingsPercent}% vs ${mostExpensive.modelName}`);
    }
  }

  return parts.join(", ") + ".";
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Recharts/Victory for charts | Custom inline SVG components | 2025+ (React 19 SSR) | Charting libraries have hydration issues with React 19 SSR. Custom SVG is SSR-safe and lighter. |
| Server-side PDF (Puppeteer) | Client-side html2pdf.js | Stable | No server binary dependency. Works on Vercel. User's browser does the rendering. |
| Client-side data loading for reports | Next.js server components | Next.js 13+ (stable) | Server components load data at the edge, no loading spinners, SEO-friendly for shareable links. |
| Custom WebSocket connections | Supabase Realtime postgres_changes | Supabase v2+ (stable) | Built-in auth, reconnection, RLS enforcement. No custom WebSocket server needed. |
| Supabase Realtime v1 (from().on()) | Supabase Realtime v2 (channel().on()) | 2024 | Channel-based API with better multiplexing, private channels, and broadcast support. |

**Deprecated/outdated:**
- `supabase.from('table').on('event', callback)`: Deprecated in favor of `supabase.channel('name').on('postgres_changes', ...)`. The old API may still work but is not recommended.
- `html2canvas` alone for PDF: Must be paired with jsPDF. Use html2pdf.js which bundles both and adds page break handling.

## Open Questions

1. **OpenRouter baseline comparison data (RPT-09)**
   - What we know: OpenRouter does NOT expose per-model median latency statistics via API. The `/api/v1/models` endpoint returns pricing, context window, and capabilities -- but not performance metrics. Model pages on the website show latency/throughput charts but these are not available programmatically.
   - What's unclear: Whether there is an undocumented API endpoint for model performance stats.
   - Recommendation: For RPT-09, compare the user's benchmark results against the curated model pricing data (cost comparison is the most actionable metric). For latency, show the user's own P50/P95 values without an external baseline -- label it "Your Benchmark Results" rather than "vs OpenRouter Global." This is honest and still valuable. If OpenRouter adds a stats API later, it can be integrated as an enhancement.

2. **SVG rendering fidelity in html2pdf.js**
   - What we know: html2pdf.js uses html2canvas which converts SVG to canvas pixels. Simple SVG elements (circle, rect, text, line) render correctly. Complex SVG features (filters, clipPath, foreignObject) may not.
   - What's unclear: Whether all three chart types (bubble, bar, bar) will render cleanly in the PDF. The dark background and custom colors need testing.
   - Recommendation: Build charts with the simplest possible SVG primitives. Test PDF export early in development. If SVG rendering fails, add a `data-html2canvas-ignore` attribute to charts and include a "charts not included in PDF" note, or switch to canvas-based rendering for chart components specifically.

3. **benchmark_runs payload size for Realtime**
   - What we know: Supabase Realtime has a message size limit (default ~10MB per message). Each benchmark_run row includes `output_json` which could be several KB.
   - What's unclear: Whether the full row payload (including output_json JSONB) causes issues when broadcast via Realtime.
   - Recommendation: The live progress only needs `model_id`, `status`, `field_accuracy`, and `exact_match` from each event. The full output_json is not needed for progress display. If payload size becomes an issue, consider using a separate "progress" update mechanism (Supabase Broadcast) instead of postgres_changes, or strip unnecessary fields in the client callback.

4. **html2pdf.js type definitions for TypeScript**
   - What we know: html2pdf.js does not ship TypeScript declarations. The npm package is JavaScript-only.
   - What's unclear: Whether a `@types/html2pdf.js` community package exists.
   - Recommendation: Create a minimal declaration file `src/types/html2pdf.d.ts` with `declare module "html2pdf.js"`. This is sufficient for the dynamic import pattern since we only call `.from().set().save()`.

## Sources

### Primary (HIGH confidence)
- [Supabase Realtime Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes) - Channel API, event types, filter syntax, configuration requirements, limitations
- [Supabase Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs) - Client component subscription patterns
- [Supabase Realtime Concepts](https://supabase.com/docs/guides/realtime/concepts) - Channel architecture, subscription lifecycle
- [Supabase Subscribing to Database Changes](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes) - Code examples for INSERT/UPDATE subscriptions
- [Supabase Replication Setup](https://supabase.com/docs/guides/database/replication/replication-setup) - Publication configuration for Realtime
- [html2pdf.js Official Docs](https://ekoopmans.github.io/html2pdf.js/) - Client-side HTML-to-PDF, options, page breaks
- [OpenRouter API Reference](https://openrouter.ai/docs/api/reference/overview) - Confirmed only /chat/completions, /generation, and /models endpoints exist. No model performance stats API.
- [OpenRouter Latency & Performance](https://openrouter.ai/docs/guides/best-practices/latency-and-performance) - Gateway latency, no per-model stats API

### Secondary (MEDIUM confidence)
- [Supabase Realtime Disconnection Handling](https://supabase.com/docs/guides/troubleshooting/realtime-handling-silent-disconnections-in-backgrounded-applications-592794) - heartbeatCallback, Web Worker option for background tabs
- [Supabase Realtime Auto Reconnect Discussion](https://github.com/orgs/supabase/discussions/27513) - Community patterns for reconnection handling
- [react-to-pdf npm](https://www.npmjs.com/package/react-to-pdf) - v3.1.0, usePDF hook API (evaluated but not recommended)
- [React Graph Gallery - Bubble Plot](https://www.react-graph-gallery.com/bubble-plot) - Custom SVG bubble chart patterns with React
- [html2pdf.js with React (remarkablemark)](https://remarkablemark.org/blog/2025/12/08/react-html2pdf/) - React integration pattern with refs

### Tertiary (LOW confidence)
- [Supabase Realtime Reconnection Issue #1088](https://github.com/supabase/realtime/issues/1088) - Known issue: reconnection after TIMED_OUT may fail. Workaround: recreate channel on CLOSED status.
- [html2canvas SVG Limitations Issue #3009](https://github.com/niklasvh/html2canvas/issues/3009) - Some SVG features may not render at high resolution in PDF

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Supabase Realtime and html2pdf.js are well-documented. Custom SVG charts have no dependencies to verify.
- Architecture: HIGH - Server-component report page with client islands is standard Next.js 16 pattern. Supabase Realtime subscription pattern verified via official docs.
- Pitfalls: HIGH - Realtime replication requirement, anon RLS policy gap, html2pdf.js dark theme handling, and SVG rendering are well-documented issues with clear prevention strategies.
- Charts: MEDIUM - Custom SVG charts will work but PDF export fidelity for SVG needs testing during implementation. The approach is sound but edge cases may surface.
- OpenRouter baseline (RPT-09): LOW - OpenRouter does not expose model performance stats via API. The requirement as stated ("your times vs global medians") cannot be fully implemented. Recommendation: reframe as cost-based comparison using known pricing data.

**Research date:** 2026-02-12
**Valid until:** 2026-03-12 (30 days -- Supabase Realtime API is stable; html2pdf.js is mature; custom SVG has no external dependencies)
