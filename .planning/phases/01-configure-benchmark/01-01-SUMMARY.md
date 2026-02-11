---
phase: 01-configure-benchmark
plan: 01
subsystem: infra
tags: [nextjs, supabase, tailwind, typescript, middleware, database, postgres, rls]

# Dependency graph
requires: []
provides:
  - "Next.js 16 App Router project scaffold with Turbopack"
  - "Supabase browser, server, and middleware clients"
  - "Middleware-based auth session refresh and route protection"
  - "Database migration with benchmark_drafts and reports tables + RLS"
  - "TypeScript types for wizard state, benchmark config, and database schema"
  - "Curated 25-model vision model lineup with pricing data"
  - "Application constants (limits, defaults, pricing)"
  - "Landing page at root route with marketing layout"
affects: [01-02, 01-03, 01-04, 02-execute-benchmark, 03-report]

# Tech tracking
tech-stack:
  added: [next@16.1.6, react@19.2.3, "@supabase/ssr@0.8", "@supabase/supabase-js@2.95", tailwindcss@4, nuqs@2.8, "@dnd-kit/react@0.2.4", react-dropzone@14.3, "@uiw/react-codemirror@4.23", "@jsonhero/schema-infer@0.1", lucide-react@0.563, zod@3.23, nanoid@5.1]
  patterns: [supabase-ssr-middleware, tailwind-v4-theme-vars, nextjs-app-router-route-groups, nuqs-adapter-root-layout]

key-files:
  created:
    - src/app/layout.tsx
    - src/app/globals.css
    - src/app/(marketing)/layout.tsx
    - src/app/(marketing)/page.tsx
    - src/lib/supabase/client.ts
    - src/lib/supabase/server.ts
    - src/lib/supabase/middleware.ts
    - src/middleware.ts
    - src/types/database.ts
    - src/types/wizard.ts
    - src/types/benchmark.ts
    - src/lib/config/models.ts
    - src/lib/config/constants.ts
    - supabase/migrations/001_initial_schema.sql
    - .env.local.example
    - next.config.ts
    - postcss.config.mjs
    - tsconfig.json
  modified:
    - package.json
    - .gitignore

key-decisions:
  - "Used @supabase/ssr middleware pattern with graceful fallback when env vars missing"
  - "Tailwind v4 CSS-native @theme with custom dark-warm palette variables"
  - "25 curated vision models across 5 tiers (free/budget/mid/premium/ultra)"
  - "Separate JSONB columns per wizard step to prevent race conditions"
  - "NuqsAdapter wraps root layout for URL state management across all pages"

patterns-established:
  - "Supabase middleware: graceful skip when NEXT_PUBLIC_SUPABASE_URL not set"
  - "Tailwind v4 theme vars: --color-void, --color-surface, --color-ember, --color-text-*"
  - "Route groups: (marketing) for public, (app) for authenticated routes"
  - "Type-safe database types with Database interface for typed Supabase queries"

# Metrics
duration: 8min
completed: 2026-02-11
---

# Phase 1 Plan 1: Project Foundation Summary

**Next.js 16 project with Supabase SSR clients, Tailwind v4 dark-warm palette, 25-model curated lineup, database migration with RLS, and complete type system**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-02-11T18:53:49Z
- **Completed:** 2026-02-11T19:02:00Z
- **Tasks:** 2
- **Files modified:** 50 (most were prototype deletions)

## Accomplishments
- Replaced Vite/React prototype with Next.js 16 App Router project using Turbopack
- Created Supabase browser, server, and middleware clients following official SSR patterns
- Built database migration with benchmark_drafts and reports tables, RLS policies, and indexes
- Defined complete type system: wizard state, benchmark config, database schema, model info
- Curated 25 vision models across 5 pricing tiers with accurate OpenRouter pricing data
- Created landing page with dark-warm palette (void/ember theme)

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize Next.js project, install dependencies, configure Tailwind v4, and create Supabase clients with middleware** - `cd506b7` (feat)
2. **Task 2: Database migration, type definitions, and config files** - `5bca44e` (feat)

## Files Created/Modified
- `src/app/layout.tsx` - Root layout with Inter + JetBrains Mono fonts, NuqsAdapter
- `src/app/globals.css` - Tailwind v4 with dark-warm palette theme variables
- `src/app/(marketing)/layout.tsx` - Marketing layout with ModelPick header
- `src/app/(marketing)/page.tsx` - Landing page with hero section and CTA
- `src/lib/supabase/client.ts` - Browser Supabase client (createBrowserClient)
- `src/lib/supabase/server.ts` - Server Supabase client (createServerClient + cookies)
- `src/lib/supabase/middleware.ts` - Session refresh + route protection with graceful env fallback
- `src/middleware.ts` - Next.js middleware calling updateSession
- `src/types/database.ts` - BenchmarkDraft, Report, Database interfaces
- `src/types/wizard.ts` - WizardConfig, Priority, Strategy, ImageEntry, SchemaConfig types
- `src/types/benchmark.ts` - ModelInfo, BenchmarkConfig, BenchmarkReport, ModelResult types
- `src/lib/config/models.ts` - 25 curated vision models with pricing and provider color maps
- `src/lib/config/constants.ts` - Application constants (limits, defaults, pricing)
- `supabase/migrations/001_initial_schema.sql` - benchmark_drafts + reports tables with RLS
- `.env.local.example` - Documents required environment variables
- `next.config.ts` - Next.js config
- `postcss.config.mjs` - PostCSS with @tailwindcss/postcss
- `tsconfig.json` - TypeScript config with path aliases
- `package.json` - All Phase 1 dependencies

## Decisions Made
- Used `@supabase/ssr` middleware pattern with graceful fallback when env vars are not set, allowing the dev server to run before Supabase is configured
- Applied Tailwind v4 CSS-native `@theme` block instead of tailwind.config.js (deprecated in v4)
- Selected 25 models (vs plan's 20 minimum) to ensure comprehensive tier coverage including dark horses like Gemini 2.0 Flash and Llama 4 Maverick
- Used separate JSONB columns per wizard step (config_data, upload_data, schema_data) to prevent race conditions on concurrent saves
- Wrapped root layout with NuqsAdapter for URL state management across all pages

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Middleware crashes when Supabase env vars are not set**
- **Found during:** Task 1 (dev server verification)
- **Issue:** `createServerClient()` throws when `NEXT_PUBLIC_SUPABASE_URL` is undefined, crashing all requests through middleware
- **Fix:** Added guard clause to skip Supabase session refresh when env vars are not configured
- **Files modified:** src/lib/supabase/middleware.ts
- **Verification:** Dev server responds with 200 without .env.local
- **Committed in:** cd506b7 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential fix for development workflow. No scope creep.

## Issues Encountered
- Next.js 16 shows deprecation warning for middleware file convention ("Please use proxy instead") -- this is informational only and middleware still works. The proxy API is not yet documented enough to adopt. No action needed.

## User Setup Required

**External services require manual configuration.** The plan frontmatter documents required setup:
- Create Supabase project and copy URL + anon key to `.env.local`
- Enable Google and GitHub OAuth providers in Supabase Dashboard
- Add redirect URLs for OAuth callbacks
- Create `benchmark-images` storage bucket
- Run `supabase/migrations/001_initial_schema.sql` in Supabase SQL Editor

## Next Phase Readiness
- Project builds and runs with zero errors
- All Supabase client patterns established, ready for auth flows (Plan 02)
- Database schema ready, pending user running migration in Supabase
- Type system complete for wizard, benchmark, and database operations
- Tailwind v4 theme variables available for all subsequent UI work

## Self-Check: PASSED

All 19 key files verified present. Both task commits (cd506b7, 5bca44e) verified in git log.

---
*Phase: 01-configure-benchmark*
*Completed: 2026-02-11*
