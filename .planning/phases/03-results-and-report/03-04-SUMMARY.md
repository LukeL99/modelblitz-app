---
phase: 03-results-and-report
plan: 04
subsystem: ui
tags: [svg-charts, pdf-export, html2pdf, data-visualization, cost-calculator, error-analysis]

# Dependency graph
requires:
  - phase: 03-03
    provides: "Report page with header, recommendation card, ranked table, share button"
  - phase: 03-01
    provides: "Pure data layer: aggregate, error-patterns, recommendation functions"
provides:
  - "SVG bubble chart (cost vs accuracy, P95 size, consistency opacity)"
  - "SVG P95 latency horizontal bar chart"
  - "SVG cost-per-run horizontal bar chart with FREE badges"
  - "Interactive cost calculator with volume slider and model comparison"
  - "Aggregated error patterns and per-model field diff analysis"
  - "Expandable raw run data accordion per model"
  - "Client-side PDF export via html2pdf.js"
affects: [gap-closure, polish, testing]

# Tech tracking
tech-stack:
  added: [html2pdf.js]
  patterns: [pure-SVG-charts, dynamic-import-for-browser-libs, server-side-data-prep-for-client-components]

key-files:
  created:
    - src/components/report/bubble-chart.tsx
    - src/components/report/latency-chart.tsx
    - src/components/report/cost-chart.tsx
    - src/components/report/cost-calculator.tsx
    - src/components/report/error-analysis.tsx
    - src/components/report/raw-runs.tsx
    - src/components/report/pdf-export-button.tsx
    - src/types/html2pdf.d.ts
  modified:
    - src/app/report/[token]/page.tsx
    - src/components/report/report-header.tsx
    - package.json

key-decisions:
  - "Pure SVG charts without charting libraries -- simple circle/rect/line/text elements for PDF export compatibility"
  - "Provider color hex map duplicated per chart file rather than shared module, trading DRY for component independence"
  - "ReportHeader accepts children prop for PdfExportButton rather than portal/slot pattern"
  - "Error analysis strips output_json to reduce serialization payload from server to client component"
  - "RPT-09 handled via cost note text since OpenRouter has no per-model latency baseline API"

patterns-established:
  - "SVG chart pattern: viewBox-based responsive scaling with className='w-full h-auto'"
  - "Dynamic import pattern for browser-only libs: const lib = (await import('lib')).default"
  - "Server-side data prep: build Records/arrays in RSC, pass serializable data to client components"

# Metrics
duration: 4min
completed: 2026-02-12
---

# Phase 3 Plan 4: Report Charts and Components Summary

**Seven report visualization components: SVG bubble/latency/cost charts, interactive cost calculator, field-level error analysis, expandable raw runs, and PDF export via html2pdf.js**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-12T18:30:36Z
- **Completed:** 2026-02-12T18:35:04Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments
- Three SVG chart components render cost-vs-accuracy bubble chart, P95 latency bars, and cost-per-run bars with provider-colored data points
- Cost calculator provides interactive daily volume slider (10-10,000) with model comparison dropdown and monthly/yearly savings projections
- Error analysis shows top 15 aggregated error patterns with expected/actual diffs plus per-model collapsible field error tables
- Raw runs accordion expands per model with pass/fail status, expandable JSON output per run
- PDF export button dynamically imports html2pdf.js and renders A4 dark-background PDF from report DOM
- Report page is now feature-complete with all RPT-01 through RPT-12 requirements fulfilled

## Task Commits

Each task was committed atomically:

1. **Task 1: SVG chart components and cost calculator** - `9adcc26` (feat)
2. **Task 2: Error analysis, raw runs, and PDF export** - `6a2be67` (feat)
3. **Task 3: Wire all components into report page** - `dc51dd0` (feat)

## Files Created/Modified
- `src/components/report/bubble-chart.tsx` - SVG bubble chart: X=cost, Y=accuracy, size=P95, opacity=consistency
- `src/components/report/latency-chart.tsx` - SVG horizontal bar chart of P95 latency sorted fastest-first
- `src/components/report/cost-chart.tsx` - SVG horizontal bar chart with FREE badge for zero-cost models
- `src/components/report/cost-calculator.tsx` - Interactive cost projector with volume slider and model comparison
- `src/components/report/error-analysis.tsx` - Aggregated error patterns + per-model field diff tables
- `src/components/report/raw-runs.tsx` - Collapsible accordion per model with expandable JSON output
- `src/components/report/pdf-export-button.tsx` - Client-side PDF export via dynamic html2pdf.js import
- `src/types/html2pdf.d.ts` - TypeScript declarations for html2pdf.js module
- `src/app/report/[token]/page.tsx` - Wired all 7 components into report page layout
- `src/components/report/report-header.tsx` - Added children prop for PdfExportButton slot
- `package.json` - Added html2pdf.js dependency

## Decisions Made
- Pure SVG charts without charting libraries (circle, rect, line, text only) for PDF export compatibility per research Pitfall 4
- Provider color hex map duplicated per chart file rather than shared module for component independence
- ReportHeader accepts children prop for PdfExportButton rather than using a portal or slot ID pattern
- Error analysis strips output_json from run data to reduce server-to-client serialization payload
- RPT-09 (OpenRouter baseline) handled via cost note text -- OpenRouter has no per-model latency baseline API

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Report page is feature-complete (RPT-01 through RPT-12)
- Phase 03 (Results and Report) is complete -- all 4 plans executed
- Ready for gap closure, polish, and testing phases

## Self-Check: PASSED

All 11 files verified present. All 3 task commits verified (9adcc26, 6a2be67, dc51dd0).

---
*Phase: 03-results-and-report*
*Completed: 2026-02-12*
