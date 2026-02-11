# Codebase Structure

**Analysis Date:** 2026-02-11

## Directory Layout

```
modelpick-prototype/
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── benchmark/            # Benchmark setup components
│   │   ├── landing/              # Landing page sections
│   │   ├── layout/               # Header/footer/navbar
│   │   └── report/               # Report page charts and analysis
│   ├── pages/                    # Top-level page components (route-level)
│   ├── data/                     # Static data and mock benchmarks
│   ├── App.tsx                   # Route definitions
│   ├── main.tsx                  # Application entry point
│   └── index.css                 # Global styles
├── public/                       # Static assets
├── .planning/                    # GSD planning documents
├── node_modules/                 # Dependencies
├── vite.config.ts                # Vite build configuration
├── tsconfig.json                 # TypeScript base config
├── tsconfig.app.json             # TypeScript app-specific config
├── tsconfig.node.json            # TypeScript node (build tools) config
├── eslint.config.js              # ESLint configuration
├── package.json                  # Dependencies and scripts
├── package-lock.json             # Locked dependency versions
└── README.md                     # Project documentation
```

## Directory Purposes

**`src/components/`:**
- Purpose: Reusable UI components organized by feature/feature area
- Contains: React functional components, no page-level logic
- Key files: See subsections below

**`src/components/benchmark/`:**
- Purpose: Components for the benchmark setup flow
- Files:
  - `CriteriaSliders.tsx` - Model selection sliders/filters
  - `ModelSelector.tsx` - UI for selecting which models to test

**`src/components/landing/`:**
- Purpose: Sections of the landing page (marketing site)
- Files:
  - `FAQ.tsx` - Frequently asked questions section
  - `Hero.tsx` - Main hero section with headline/CTA
  - `HowItWorks.tsx` - Step-by-step process explanation
  - `ModelLogos.tsx` - Provider logos/brands
  - `Pricing.tsx` - Pricing tiers display
  - `ReportPreview.tsx` - Example report preview
  - `WhatWeTest.tsx` - Features/capabilities list

**`src/components/layout/`:**
- Purpose: Shared layout components (header/footer/nav)
- Files:
  - `Footer.tsx` - Site footer with links
  - `Navbar.tsx` - Navigation bar (not used in current pages; LandingPage has inline nav)

**`src/components/report/`:**
- Purpose: Components that make up the report page
- Files:
  - `AccuracyCostScatter.tsx` - Scatter plot (not currently used in main flow)
  - `CostCalculator.tsx` - Monthly cost projection tool
  - `CostChart.tsx` - Bar chart of cost per run
  - `LatencyChart.tsx` - Bar chart of P95 latency
  - `RankedTable.tsx` - Main results table
  - `RawOutputs.tsx` - Raw run data with expandable rows
  - `RecommendationCard.tsx` - Top model recommendation

**`src/pages/`:**
- Purpose: Full-page components that map 1:1 to routes
- Files:
  - `LandingPage.tsx` - Home page (route: `/`)
  - `BenchmarkPage.tsx` - Benchmark setup form (route: `/benchmark`)
  - `ProcessingPage.tsx` - Progress display during execution (route: `/benchmark/:id/progress`)
  - `ReportPage.tsx` - Full benchmark report (route: `/report/:id`)
  - `SharedReportPage.tsx` - Public shared report view (route: `/shared/:id`)

**`src/data/`:**
- Purpose: Static data, interfaces, and mock data
- Files:
  - `models.ts` - Core data: ModelData interface, MODELS array (20 models), color maps, error examples, generateRunData function
  - `mockBenchmark.ts` - Alternative mock data set with ModelResult interface, benchmark config, recommendations (appears to be legacy/unused in current flow)

**`public/`:**
- Purpose: Static assets served as-is
- Contents: favicon, sample images (receipts), etc.

**`src/index.css`:**
- Purpose: Global styles, Tailwind directives, CSS variables
- Contains: Tailwind @apply directives, custom color variables for dark theme

## Key File Locations

**Entry Points:**
- `src/main.tsx` - React root initialization, BrowserRouter wrapper
- `src/App.tsx` - Route definitions
- `index.html` - HTML template (root <div id="root">)

**Configuration:**
- `vite.config.ts` - Vite + React plugin + Tailwind CSS plugin
- `tsconfig.app.json` - Strict TypeScript, JSX setup
- `eslint.config.js` - ESLint rules (strict mode)
- `package.json` - Dependencies: React 19, React Router 7, Tailwind 4, Recharts, Lucide React

**Core Logic:**
- `src/data/models.ts` - All benchmark data model definitions and constants
- `src/pages/ReportPage.tsx` - Complex report page with sorting, filtering, charts (largest file, ~765 lines)
- `src/pages/ProcessingPage.tsx` - Simulation of benchmark execution with progress tracking

**Styling:**
- `src/index.css` - Global Tailwind and CSS variables
- All components use `className` with Tailwind utility classes (no separate CSS files)

**Testing:**
- No test files detected in codebase
- No Jest, Vitest, or Playwright configuration

## Naming Conventions

**Files:**
- Page components: PascalCase with `.tsx` (e.g., `LandingPage.tsx`, `ReportPage.tsx`)
- Feature components: PascalCase with `.tsx` (e.g., `CostCalculator.tsx`, `LatencyChart.tsx`)
- Data files: camelCase with `.ts` (e.g., `models.ts`, `mockBenchmark.ts`)
- Styles: No separate style files; all Tailwind inline in JSX

**Directories:**
- Feature-based grouping: `components/landing/`, `components/report/`, `components/benchmark/`
- Page-level directory: `pages/`
- Data/constants directory: `data/`

**Components:**
- Default export (one component per file typically)
- Function declaration: `export default function ComponentName() { ... }`
- Props destructured in function signature

**Variables/Functions:**
- camelCase for functions and variables: `setUploadedImages`, `handleSort`, `generateRunData`
- UPPER_CASE for constants: `MODELS`, `EXPECTED_JSON`, `PROVIDER_COLORS`, `METRIC_TOOLTIPS`

**Interfaces/Types:**
- PascalCase: `ModelData`, `ErrorExample`, `RunDetail`, `ModelProgress`
- Prefix with interface name in constants: `error.errorType` (inside ErrorExample), `model.tier` (inside ModelData)

## Where to Add New Code

**New Feature (e.g., New Benchmark Metric):**
- Primary code: `src/components/report/` (new chart component) or extend existing
- Data structure: Add field to `ModelData` interface in `src/data/models.ts`
- Usage: Import and use in report page or create new report section

**New Component/Module:**
- UI component: `src/components/[feature-area]/NewComponent.tsx`
- Page component: `src/pages/NewPage.tsx`, add route to `src/App.tsx`
- Integration: Import in parent page or component, pass props

**New Page (New Route):**
- Create: `src/pages/NewPage.tsx`
- Update: `src/App.tsx` to add `<Route path="/new-path" element={<NewPage />} />`
- Navigation: Add Link in existing components: `<Link to="/new-path">Label</Link>`

**Utilities/Helpers:**
- Shared functions: `src/utils/` (doesn't exist yet; create if needed)
- Currently: Inline functions in components or added to `src/data/models.ts` if data-related

**Styling/Theme:**
- Tailwind utilities: Use directly in `className` attributes
- New CSS variables: Add to `src/index.css` with `--var-name` convention
- Color system: Add to color maps in `src/data/models.ts` (PROVIDER_COLORS, TIER_COLORS)

## Special Directories

**`.planning/`:**
- Purpose: GSD (Guided Software Development) planning documents
- Generated: Yes, by GSD commands
- Committed: Yes, stored in git

**`node_modules/`:**
- Purpose: Installed npm packages
- Generated: Yes, by `npm install`
- Committed: No, ignored by .gitignore

**`public/`:**
- Purpose: Static assets served directly by Vite dev server and bundled in production
- Generated: No (manually maintained)
- Committed: Yes

## Build and Dev Configuration

**Development:**
```bash
npm run dev           # Vite dev server with hot reload
npm run build         # Production build (tsc + vite build)
npm run lint          # ESLint check
npm run preview       # Preview production build locally
```

**Build Pipeline:**
1. TypeScript compilation (`tsc -b`) with strict checks
2. Vite bundling with:
   - React refresh plugin for HMR
   - Tailwind CSS v4 JIT compilation
3. Output: `dist/` directory (not tracked in git)

**TypeScript Paths:**
- No path aliases configured (no `paths` in tsconfig)
- All imports are relative or from node_modules

---

*Structure analysis: 2026-02-11*
