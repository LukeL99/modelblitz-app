---
phase: 02-pay-and-run
plan: 01
subsystem: payments
tags: [stripe, supabase, nanoid, webhooks, checkout, mock-infrastructure]

# Dependency graph
requires:
  - phase: 01-configure-benchmark
    provides: "Wizard flow with draft creation, model selection, cost estimation, and 'ready' status"
provides:
  - "benchmark_runs table for per-run engine results"
  - "stripe_session_id column on reports table"
  - "Supabase admin client (service-role, bypasses RLS)"
  - "Stripe server SDK with lazy initialization"
  - "Debug mock infrastructure (stripe, openrouter, email toggles)"
  - "MockIndicator UI component for dev mode"
  - "Checkout API with budget pre-calculation and Stripe session creation"
  - "Stripe webhook handler with idempotent report creation and share_token"
  - "Confirmation screen with benchmark summary and payment CTA"
  - "Checkout success/cancel pages"
  - "Processing page with spinner"
affects: [02-02, 02-03, 03-progress-display]

# Tech tracking
tech-stack:
  added: [stripe]
  patterns: [lazy-singleton, mock-toggle-env-vars, after-deferred-execution, budget-enforcement]

key-files:
  created:
    - supabase/migrations/003_benchmark_runs.sql
    - src/lib/supabase/admin.ts
    - src/lib/stripe/client.ts
    - src/lib/stripe/config.ts
    - src/lib/debug/mock-config.ts
    - src/components/debug/mock-indicator.tsx
    - src/app/api/checkout/route.ts
    - src/app/api/webhooks/stripe/route.ts
    - src/app/checkout/success/page.tsx
    - src/app/checkout/cancel/page.tsx
    - src/app/(app)/benchmark/[id]/processing/page.tsx
    - src/components/wizard/confirmation-screen.tsx
  modified:
    - src/types/database.ts
    - src/lib/config/constants.ts
    - .env.local.example
    - src/app/layout.tsx
    - src/app/(app)/benchmark/new/page.tsx
    - package.json

key-decisions:
  - "Stripe client uses lazy initialization via getStripe() to prevent build failures without API keys"
  - "Stripe API version 2026-01-28.clover matches installed stripe package type constraints"
  - "Webhook uses @ts-expect-error for engine import since engine.ts is created in Plan 02-03"

patterns-established:
  - "Lazy singleton: getStripe() initializes once on first call, caches, returns null if unconfigured"
  - "Mock toggle: DEBUG_MOCK_* env vars control service mocking, NEXT_PUBLIC_DEBUG_MOCKS for client-side"
  - "Budget enforcement: pre-calculate cost before payment, optimize runs or reject if over ceiling"
  - "Deferred execution: after() from next/server for post-webhook background work"

# Metrics
duration: 16min
completed: 2026-02-11
---

# Phase 2 Plan 1: Stripe Payment Infrastructure Summary

**Stripe Checkout flow with budget enforcement, webhook-based idempotent report creation, mock infrastructure, and confirmation-to-processing page pipeline**

## Performance

- **Duration:** 16 min
- **Started:** 2026-02-11T23:00:32Z
- **Completed:** 2026-02-11T23:17:19Z
- **Tasks:** 2
- **Files modified:** 18

## Accomplishments
- Database migration for benchmark_runs table with per-run result columns and RLS, plus stripe_session_id on reports
- Stripe Checkout integration with lazy-initialized client, budget pre-calculation, and cost optimization
- Webhook handler that creates reports idempotently with share_token (nanoid) and defers engine execution
- Debug mock infrastructure with environment variable toggles and visual indicator badge
- Complete checkout page flow: confirmation screen -> Stripe redirect -> success/cancel -> processing page
- Mock Stripe mode bypasses payment entirely for development

## Task Commits

Each task was committed atomically:

1. **Task 1: Database migration, Supabase admin client, Stripe client, debug mock infrastructure, and extended types** - `7b52ba7` (feat)
2. **Task 2: Checkout API route, Stripe webhook handler, confirmation screen, and checkout pages** - `dc141f7` (feat)

## Files Created/Modified
- `supabase/migrations/003_benchmark_runs.sql` - benchmark_runs table, stripe_session_id column, RLS policies
- `src/lib/supabase/admin.ts` - Service-role Supabase client bypassing RLS
- `src/lib/stripe/client.ts` - Lazy-initialized Stripe SDK singleton
- `src/lib/stripe/config.ts` - Webhook secret and checkout URL configuration
- `src/lib/debug/mock-config.ts` - Mock detection for stripe/openrouter/email services
- `src/components/debug/mock-indicator.tsx` - Fixed-position dev badge showing active mocks
- `src/types/database.ts` - BenchmarkRun interface, stripe_session_id on Report, Database tables
- `src/lib/config/constants.ts` - HARD_COST_CEILING, INTERNAL_COST_BUFFER, concurrency constants
- `.env.local.example` - All Phase 2 environment variables
- `src/app/layout.tsx` - MockIndicator added to root layout
- `src/app/api/checkout/route.ts` - POST endpoint creating Stripe Checkout or mock report
- `src/app/api/webhooks/stripe/route.ts` - POST endpoint for checkout.session.completed webhook
- `src/app/checkout/success/page.tsx` - Auto-refreshing success page that redirects to processing
- `src/app/checkout/cancel/page.tsx` - Cancel page with retry button
- `src/app/(app)/benchmark/[id]/processing/page.tsx` - Processing page with spinner and stats
- `src/components/wizard/confirmation-screen.tsx` - Benchmark summary with Pay $14.99 button
- `src/app/(app)/benchmark/new/page.tsx` - Wired confirmation screen after wizard Step 3 completion

## Decisions Made
- Stripe client uses lazy initialization via `getStripe()` function instead of module-level `new Stripe()` -- prevents build failures when STRIPE_SECRET_KEY is not set in environment
- Stripe API version `2026-01-28.clover` used to match installed stripe package type constraints (auto-detected from TS error)
- Webhook uses `@ts-expect-error` for benchmark engine import since `engine.ts` is created in Plan 02-03 -- the dynamic import fails gracefully in the try/catch

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Stripe client causing build failure without API key**
- **Found during:** Task 2 (build verification)
- **Issue:** `new Stripe(process.env.STRIPE_SECRET_KEY!)` at module level throws "Neither apiKey nor config.authenticator provided" during `npm run build` when env var is not set
- **Fix:** Refactored to lazy singleton pattern with `getStripe()` function that initializes on first call and returns null if key is missing
- **Files modified:** src/lib/stripe/client.ts, src/app/api/checkout/route.ts, src/app/api/webhooks/stripe/route.ts
- **Verification:** `npm run build` succeeds without STRIPE_SECRET_KEY set
- **Committed in:** dc141f7 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed Stripe API version type mismatch**
- **Found during:** Task 1 (TypeScript check)
- **Issue:** Used `"2025-12-18.acacia"` but installed stripe package expects `"2026-01-28.clover"`
- **Fix:** Updated apiVersion to match the installed package's type definition
- **Files modified:** src/lib/stripe/client.ts
- **Verification:** `npx tsc --noEmit` passes
- **Committed in:** 7b52ba7 (Task 1 commit)

**3. [Rule 3 - Blocking] Installed missing stripe dependency**
- **Found during:** Task 1 (beginning of execution)
- **Issue:** stripe package not in package.json
- **Fix:** Ran `npm install stripe`
- **Files modified:** package.json, package-lock.json
- **Verification:** Import succeeds, build passes
- **Committed in:** 7b52ba7 (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (2 bugs, 1 blocking)
**Impact on plan:** All auto-fixes necessary for build correctness. No scope creep.

## Issues Encountered
None beyond the auto-fixed deviations.

## User Setup Required

External services require manual configuration before real payments work:

**Stripe:**
- Set `STRIPE_SECRET_KEY` (test key from Stripe Dashboard -> Developers -> API keys)
- Set `STRIPE_WEBHOOK_SECRET` (from `stripe listen --forward-to localhost:3000/api/webhooks/stripe`)
- Install Stripe CLI for local webhook testing: https://docs.stripe.com/stripe-cli

**Supabase:**
- Set `SUPABASE_SERVICE_ROLE_KEY` (from Supabase Dashboard -> Settings -> API)
- Run migration `003_benchmark_runs.sql` in Supabase SQL Editor

**For development without real services:**
- Set `DEBUG_MOCK_STRIPE=true` to bypass Stripe entirely
- Set `DEBUG_MOCK_OPENROUTER=true` for future mock API calls
- Set `NEXT_PUBLIC_DEBUG_MOCKS=stripe,openrouter` for client-side mock indicator

## Next Phase Readiness
- Payment infrastructure complete, ready for benchmark engine (Plan 02-03)
- Mock Stripe mode allows full development flow without real payment credentials
- Processing page placeholder ready for Phase 3 live progress replacement
- Webhook's after() call will automatically trigger engine once it exists

## Self-Check: PASSED

All 13 created files verified on disk. Both task commits (7b52ba7, dc141f7) verified in git history.

---
*Phase: 02-pay-and-run*
*Completed: 2026-02-11*
