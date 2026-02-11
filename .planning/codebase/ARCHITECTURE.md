# Architecture

**Analysis Date:** 2026-02-11

## Pattern Overview

**Overall:** Client-side SPA (Single Page Application) with multi-page router-based navigation

**Key Characteristics:**
- React 19 with React Router v7 for client-side routing
- Vite-based development with TypeScript strict mode
- Tailwind CSS v4 for styling with dark theme (void/surface/surface-raised color system)
- Recharts for data visualization components
- Lucide React for icon system
- No backend integration (currently static mock data)

## Layers

**Presentation/UI Layer:**
- Purpose: Render UI components and handle user interactions
- Location: `src/components/` and `src/pages/`
- Contains: Page components, feature components, layout wrappers, charts
- Depends on: React, React Router, data layer (models.ts, mockBenchmark.ts)
- Used by: React Router entry point via `src/App.tsx`

**Data/State Layer:**
- Purpose: Provide mock data, interfaces, and test data
- Location: `src/data/`
- Contains: Model definitions (`models.ts`), mock benchmarks (`mockBenchmark.ts`), error examples
- Depends on: Nothing (pure data)
- Used by: All components and pages that need model/benchmark data

**Routing Layer:**
- Purpose: Define application navigation and page structure
- Location: `src/App.tsx`
- Contains: Route definitions using React Router `<Routes>` and `<Route>`
- Depends on: Page components
- Used by: React entry point in `src/main.tsx`

**Entry Point:**
- Purpose: Bootstrap React application into DOM
- Location: `src/main.tsx`
- Contains: React root creation, BrowserRouter wrapper, StrictMode
- Depends on: App component, React, React Router

## Data Flow

**User Landing → Benchmark Setup:**

1. User arrives at `/` (LandingPage)
2. User clicks "Run a Benchmark" → navigates to `/benchmark`
3. BenchmarkPage (`src/pages/BenchmarkPage.tsx`) loads with:
   - SAMPLE_RECEIPTS (local sample data)
   - MODELS list (from `src/data/models.ts`)
   - EXPECTED_JSON template (from `src/data/models.ts`)
4. User configures images, JSON schema, model selection
5. User submits → navigates to `/benchmark/:id/progress`

**Processing → Report Generation:**

1. ProcessingPage (`src/pages/ProcessingPage.tsx`) loads
2. Simulates model execution with progress tracking via setInterval
3. Updates ModelProgress state for each model
4. On completion → auto-navigates to `/report/:id`

**Report Viewing:**

1. ReportPage (`src/pages/ReportPage.tsx`) renders with:
   - Recommendation card (top-ranked model)
   - Ranked table with sort functionality
   - Bubble chart (Accuracy vs Cost, sized by latency, opacity by consistency)
   - Latency bar chart (P95 per model)
   - Cost per run chart
   - OpenRouter baseline comparison
   - Cost calculator (interactive monthly projection)
   - Error analysis (expandable error details with JSON diff)
   - Raw run data (expandable run-by-run results)
2. Data sourced from `src/data/models.ts` (MODELS, ERROR_EXAMPLES, generateRunData function)

**Shared Report:**

1. SharedReportPage (`src/pages/SharedReportPage.tsx`) renders similar to ReportPage
2. Used for public sharing via link
3. Data likely passed as route params or stored externally

**State Management:**

- No centralized state management (no Redux, Zustand, Jotai)
- Local component state via `useState`
- Each page/component manages its own state
- Data passed via props or imported directly from `src/data/`

## Key Abstractions

**ModelData Interface:**
- Purpose: Defines shape of a single model's benchmark data
- Location: `src/data/models.ts`
- Fields: rank, model name, provider, tier, accuracy %, latency metrics (p95, p99, median, ttft), cost, spread
- Pattern: Exported as interface used throughout app

**ErrorExample Interface:**
- Purpose: Represents error details when a model fails on a run
- Location: `src/data/models.ts`
- Holds: Model name, list of field-level errors with expected/actual values, full JSON comparison
- Pattern: Array of examples in ERROR_EXAMPLES constant

**RunDetail (from mockBenchmark.ts):**
- Purpose: Represents a single test run result for a model
- Generated via `generateRunData(model, runsPerModel)` function
- Contains: run number, correctness boolean, response time, token count
- Pattern: Deterministic generation from model rank seed for reproducibility

**Color Constants:**
- Purpose: Define design system colors
- Location: `src/data/models.ts`
- PROVIDER_COLORS: Maps provider name to hex color
- TIER_COLORS: Maps tier (Premium/Mid/Budget) to hex color
- Pattern: Used consistently in charts and badges

## Entry Points

**`src/main.tsx`:**
- Location: Application bootstrap file
- Triggers: DOM ready
- Responsibilities: Mount React root, wrap app in BrowserRouter

**`src/App.tsx`:**
- Location: Route definitions
- Triggers: On route change via browser/navigate
- Responsibilities: Define all routes, lazy-load page components

**Landing Page: `/`**
- Location: `src/pages/LandingPage.tsx`
- Triggers: User visits app or clicks home logo
- Responsibilities: Marketing content, call-to-action, example report preview

**Benchmark Setup: `/benchmark`**
- Location: `src/pages/BenchmarkPage.tsx`
- Triggers: User clicks "Run a Benchmark"
- Responsibilities: Image upload, JSON schema definition, model selection, payment handling

**Processing: `/benchmark/:id/progress`**
- Location: `src/pages/ProcessingPage.tsx`
- Triggers: User submits benchmark setup
- Responsibilities: Show progress bar, simulate model execution, auto-redirect on completion

**Report: `/report/:id`**
- Location: `src/pages/ReportPage.tsx`
- Triggers: ProcessingPage auto-redirect or direct URL access
- Responsibilities: Render full benchmark report with charts and analysis

**Shared Report: `/shared/:id`**
- Location: `src/pages/SharedReportPage.tsx`
- Triggers: User shares report link
- Responsibilities: Public view of report (likely read-only)

## Error Handling

**Strategy:** Try-catch is minimal; primarily prop validation and optional chaining

**Patterns:**
- Optional chaining for nested object access: `MODELS.find(m => m.model === compareModel)?.costPerRun ?? MODELS[0].costPerRun`
- Fallback values in calculations: `const compareModelCost = ... ?? MODELS[0].costPerRun`
- No explicit error states or error boundaries observed in components
- User-facing errors shown via Toast component in ReportPage

## Cross-Cutting Concerns

**Logging:** None detected; no logging library integrated

**Validation:**
- JSON schema validation in BenchmarkPage textarea (user-editable)
- No form validation library detected
- Implicit validation via TypeScript types

**Authentication:**
- Not implemented; no auth provider detected
- Pricing/payment UI mocked (showPayment state in BenchmarkPage)

**Styling:**
- Tailwind CSS + Tailwind CSS Vite plugin for development
- Color system in CSS variables (--void, --surface, --surface-raised, --ember, --text-primary, etc.)
- Responsive design via Tailwind breakpoints (sm, md, lg)

**Accessibility:**
- Basic semantic HTML
- Icon library (Lucide React) provides accessibility
- Some tooltip/hover hints for metric explanations via custom Tooltip component

**Performance:**
- React.StrictMode enabled for development mode checks
- Vite for fast dev builds and optimized production bundles
- Lazy loading via route-based code splitting (React Router handles this)

---

*Architecture analysis: 2026-02-11*
