# Codebase Concerns

**Analysis Date:** 2026-02-11

## Tech Debt

**Component Size and Complexity:**
- Issue: `src/pages/ReportPage.tsx` is 765 lines, containing multiple concerns (sorting, filtering, UI rendering, calculations) in a single component
- Files: `src/pages/ReportPage.tsx` (765 lines), `src/pages/SharedReportPage.tsx` (375 lines)
- Impact: Difficult to test, maintain, and reason about. Changes to one feature risk breaking others. High cognitive load for developers.
- Fix approach: Extract smaller, reusable components (DiffJson, CorrectBadge, Toast, CostCalculator logic). Consider composing larger pages from smaller, focused components. Break into presentation vs. business logic layers.

**Duplicate Code Between Report Pages:**
- Issue: `ReportPage.tsx` and `SharedReportPage.tsx` share ~70% of logic (sorting, filtering, state management, chart rendering)
- Files: `src/pages/ReportPage.tsx`, `src/pages/SharedReportPage.tsx`
- Impact: Maintenance burden—bugs fixed in one file need fixing in the other. Feature additions require double work. Increases risk of divergence.
- Fix approach: Extract shared hooks (useSortedModels, useTotalRuns, etc.) and shared components (ReportHeader, ModelTable, CostCalculator). Make SharedReportPage a wrapper around reusable page layout components.

**Hardcoded Magic Numbers and Strings:**
- Issue: Constants scattered throughout components: '3000' (toast timeout), '50' (runs per model), '100'-'10000' (extraction sliders), 'GPT-4o' (default model), 'demo-123' (demo IDs), coordinate calculations (45, 105, 0.02 in bubble chart)
- Files: `src/pages/ReportPage.tsx` (lines 114, 508-523), `src/pages/ProcessingPage.tsx` (lines 16, 52, 82, 91), `src/pages/BenchmarkPage.tsx` (line 19), `src/data/models.ts` (implicit defaults)
- Impact: Hard to change global behavior (e.g., extending toast duration, changing runs per model). No single source of truth. Risk of inconsistency.
- Fix approach: Create `src/constants/config.ts` with TOAST_DURATION, RUNS_PER_MODEL, DAILY_EXTRACTION_RANGE, DEFAULT_COMPARE_MODEL, BUBBLE_CHART_RANGES. Update all usages to import from constants.

**No Error Handling or Validation:**
- Issue: Zero try-catch blocks, no input validation, no error boundaries, no null checks on critical data
- Files: All components, especially `src/pages/ReportPage.tsx` (lines 133-134), `src/pages/SharedReportPage.tsx` (line 44)
- Impact: Missing a model in MODELS array or null data crashes silently. Users see broken UI with no feedback. Payment form has no validation.
- Fix approach: Add error boundaries around major sections. Validate MODELS array on load. Add null coalescing to critical calculations. Show user-friendly error messages for edge cases (line 133: `?? MODELS[0]` hides bugs).

## Known Bugs

**Bubble Chart Positioning with Edge Cases:**
- Symptoms: Bubbles near 100% accuracy or 0% cost may overflow chart bounds visually
- Files: `src/pages/ReportPage.tsx` (lines 287-322)
- Trigger: When any model reaches accuracy close to 100% or cost very close to 0
- Workaround: Manual Math.min/Math.max clamping on line 308-309 prevents overflow, but positioning math is fragile. Chart coordinate space mismatch between comment (line 289-292) and code (line 293).

**ProcessingPage Timeout Logic Unclear:**
- Symptoms: ForceComplete timeout at 15 seconds (line 91) may not align with actual interval completion. Both interval and timeout can trigger navigation.
- Files: `src/pages/ProcessingPage.tsx` (lines 30-97)
- Trigger: Run the processing page and let it complete naturally
- Workaround: Timeout always fires, so it works, but could navigate while UI is still updating.

**Toast Cleanup Not Guaranteed:**
- Symptoms: If toast is shown just before component unmounts, setTimeout may fire after unmount
- Files: `src/pages/ReportPage.tsx` (lines 112-115)
- Trigger: Click "Share" and immediately navigate away
- Workaround: None. Component unmounts before cleanup happens. Currently benign but could cause warnings in strict mode.

## Security Considerations

**No Input Validation on Benchmark Setup:**
- Risk: BenchmarkPage accepts arbitrary JSON input with no schema validation. Malformed JSON crashes parser. No size limits on image uploads.
- Files: `src/pages/BenchmarkPage.tsx` (line 17), form inputs
- Current mitigation: Frontend only. Demo data is pre-populated, so users rarely enter data. No backend validation mentioned.
- Recommendations: Add Zod schema for JSON validation. Validate schema matches expected structure before submission. Add file size/count limits.

**Hardcoded Demo IDs:**
- Risk: All routes navigate to hardcoded 'demo-123' (line 170, 172, 211, 32). No user-specific data isolation. Sharing this URL reveals benchmark data.
- Files: `src/pages/BenchmarkPage.tsx`, `src/pages/ReportPage.tsx` (line 170), `src/pages/ProcessingPage.tsx` (line 27)
- Current mitigation: Demo data only, not user data.
- Recommendations: Generate unique IDs for each benchmark run. Validate access control when retrieving shared reports. Never include user data in demo URLs.

## Performance Bottlenecks

**Bubble Chart Re-renders Every Calculation:**
- Problem: Chart re-renders on every state change (sorting, slider movement) even when MODELS data unchanged
- Files: `src/pages/ReportPage.tsx` (lines 287-322)
- Cause: Bubble positioning calculated inline, no memoization, all 20 bubbles re-render
- Improvement path: Extract BubbleChart to separate component, memoize with React.memo, use useMemo for bubble calculations

**Table Sorting Creates New Array Every Render:**
- Problem: Line 126 creates new sorted array every time component renders
- Files: `src/pages/ReportPage.tsx` (line 126), `src/pages/SharedReportPage.tsx` (line 37)
- Cause: `[...MODELS].sort()` is not memoized
- Improvement path: Wrap sort logic in useMemo with dependency on sortKey and sortAsc

**Cost Calculator Iterates and Filters Repeatedly:**
- Problem: Lines 132-138 filter, sort, and recalculate on every render
- Files: `src/pages/ReportPage.tsx` (lines 132-138)
- Cause: No memoization, redundant calculations
- Improvement path: Use useMemo for top5, cheapestAccurate, mostExpensiveTop5, savings calculations

## Fragile Areas

**MODELS Data Structure Tightly Coupled:**
- Files: `src/data/models.ts`, `src/pages/ReportPage.tsx`, `src/pages/SharedReportPage.tsx`, `src/components/report/*.tsx`
- Why fragile: All components assume MODELS[0] is the "best" model (line 132 in ReportPage). Adding a new metric requires updating sort logic in 3+ places. Type `ModelData` has 14 fields but some components only use subset—renaming/removing breaks multiple pages.
- Safe modification: Extract MODELS queries into hooks (useBestModel, useTopModels, useModelByName). Create view models that transform ModelData for specific pages.
- Test coverage: No unit tests. If MODELS ranking changes, no tests catch that cascading effects break assumptions.

**Toast Implementation Not Reusable:**
- Files: `src/pages/ReportPage.tsx` (lines 92-98, 112-115)
- Why fragile: Toast logic hardcoded inline. If other pages need toasts, they duplicate code. Timeout is fixed at 3000ms, can't be customized.
- Safe modification: Extract Toast to `src/components/ui/Toast.tsx` with props for duration, position, message. Create useToast hook for state management.
- Test coverage: No tests. Toast animation and dismiss logic untested.

**Sidebar/Modal State Explosion:**
- Files: `src/pages/ReportPage.tsx` (lines 105-110)
- Why fragile: 5 separate useState calls for expandable sections (expandedErrors, expandedRuns, showAllRuns, expandedRunDiffs, toast). Pattern breaks if adding new expandable sections. Hard to sync state across re-renders.
- Safe modification: Use single useState for expanded state keyed by section ID: `{ errors: Set<string>, runs: Set<string>, runDiffs: Set<string> }`
- Test coverage: No tests for expand/collapse behavior.

## Scaling Limits

**MODELS Array Hard-Coded at 20 Models:**
- Current capacity: Exactly 20 models in `src/data/models.ts`
- Limit: Adding more models breaks hardcoded indices and assumptions. SharedReportPage line 43 uses `top5 = MODELS.slice(0, 5)` which assumes first 5 are top-ranked.
- Scaling path: Make number of models configurable. Update rank-dependent logic to sort dynamically instead of relying on array order.

**Processing Page UI O(n) Renders:**
- Current capacity: 20 models, UI remains responsive
- Limit: 100+ models would cause jank in ProcessingPage (line 99+) due to list rendering without virtualization
- Scaling path: Add React.memo to model progress items. Consider virtualization if model list exceeds 50.

**Bubble Chart with Many Models:**
- Current capacity: 20 bubbles acceptable
- Limit: 100+ bubbles causes canvas/DOM perf degradation. Hover tooltips not batched.
- Scaling path: Switch to canvas-based chart library (e.g., Plotly) or add clustering for dense regions.

## Dependencies at Risk

**No Type Safety on Chart Data:**
- Risk: Recharts components expect specific data shape but receive loosely-typed objects
- Files: `src/pages/ReportPage.tsx` (lines 364, 418, 447), `src/components/report/AccuracyCostScatter.tsx` (line 49)
- Impact: TSLint disables on line 48: `// eslint-disable-next-line @typescript-eslint/no-explicit-any` suggests type issues. Renaming ModelData fields breaks charts silently.
- Migration plan: Create strict types for Recharts data. Define BarChartData, ScatterChartData as interfaces that transform ModelData safely.

**React Router ID Parameters Not Validated:**
- Risk: Routes accept arbitrary ID params (`/report/:id`, `/shared/:id`, `/benchmark/:id/progress`) with no validation
- Files: `src/App.tsx` (lines 13-15)
- Impact: Typos in URLs don't produce 404s, just load demo data for unknown IDs
- Migration plan: Add useParams validation hook. Return NotFound component if ID doesn't match expected pattern or doesn't exist.

## Missing Critical Features

**No API Integration for Real Benchmarks:**
- Problem: All data is hardcoded MODELS array. No actual benchmark execution, payment processing, or result storage.
- Blocks: Can't save user benchmarks, can't retrieve past results, can't charge users
- Status: This is a prototype, but the hardcoded approach means adding backend integration later requires major refactoring

**No Accessibility Support:**
- Problem: No ARIA labels, role attributes, alt text on visual elements. Color-only indicators (red/green) not accessible to colorblind users.
- Files: All components, especially charts
- Status: Would fail WCAG compliance scan

**No Dark Mode Toggle:**
- Problem: Colors hardcoded to dark theme. No light theme option despite Tailwind setup supporting it.
- Files: All components with color classes

## Test Coverage Gaps

**Zero Unit Tests:**
- What's not tested: All business logic (sorting, filtering, calculations). UI components have no snapshot or interaction tests.
- Files: All `src/` except `src/data/models.ts` (static data)
- Risk: Refactoring is risky. Bug-for-bug compatibility maintained by accident.
- Priority: High—should add Jest/Vitest config and tests for calculation functions (monthlyCost, savings, bubble positioning)

**No Integration Tests:**
- What's not tested: Navigation flow (benchmark → processing → report), state persistence across page transitions
- Files: Page components and routing
- Risk: Moving between pages may fail silently due to missing route params or state
- Priority: Medium—add E2E tests using Playwright or Cypress to verify user flows

**No Visual Regression Tests:**
- What's not tested: Chart rendering, responsive layouts at different breakpoints
- Files: Chart components, layout components
- Risk: CSS changes may break layout without anyone noticing
- Priority: Medium—add Chromatic or Percy for visual diffs

**No Type Safety Tests:**
- What's not tested: TypeScript strict mode compliance. @ts-expect-error comments bypassed
- Files: `src/components/report/AccuracyCostScatter.tsx` (line 48), possibly others
- Risk: Type errors masked by any types
- Priority: Medium—enforce strict TypeScript, remove @ts-ignore patterns, add typing for all data transformations

---

*Concerns audit: 2026-02-11*
