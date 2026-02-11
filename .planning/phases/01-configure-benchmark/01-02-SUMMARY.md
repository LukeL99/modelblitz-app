---
phase: 01-configure-benchmark
plan: 02
subsystem: auth, ui
tags: [supabase-auth, oauth, magic-link, pkce, dashboard, nextjs, react, tailwind]

# Dependency graph
requires:
  - phase: 01-01
    provides: "Supabase browser/server/middleware clients, Tailwind v4 dark-warm palette, database schema with reports table, TypeScript types"
provides:
  - "Login page with email/password, Google OAuth, GitHub OAuth, and magic link"
  - "Signup page with email confirmation flow"
  - "OAuth and magic link callback route (PKCE exchange)"
  - "Email confirmation callback route"
  - "Authenticated app layout with nav bar and auth guard"
  - "Dashboard page with empty state for new users and report list for returning users"
  - "Shared Button component (primary/secondary/ghost, sm/md/lg, loading)"
  - "Shared Card component with header/content sections"
  - "Sign-out button client component"
affects: [01-03, 01-04, 02-execute-benchmark, 03-report]

# Tech tracking
tech-stack:
  added: []
  patterns: [supabase-pkce-callback, server-component-auth-guard, client-component-oauth, route-group-auth-protection]

key-files:
  created:
    - src/components/ui/button.tsx
    - src/components/ui/card.tsx
    - src/components/auth/login-form.tsx
    - src/components/auth/signup-form.tsx
    - src/components/auth/social-buttons.tsx
    - src/components/auth/sign-out-button.tsx
    - src/app/auth/login/page.tsx
    - src/app/auth/signup/page.tsx
    - src/app/auth/callback/route.ts
    - src/app/auth/confirm/route.ts
    - src/app/(app)/layout.tsx
    - src/app/(app)/dashboard/page.tsx
    - src/components/dashboard/empty-state.tsx
    - src/components/dashboard/report-card.tsx
    - src/components/dashboard/report-list.tsx
  modified:
    - src/lib/supabase/middleware.ts

key-decisions:
  - "Fixed middleware route protection to match actual URL paths (/dashboard, /benchmark) instead of route group names (/(app))"
  - "Social buttons above divider, email/password form below on auth pages"
  - "Sign-out button extracted as separate client component to keep app layout as server component"

patterns-established:
  - "Auth pages: centered card (max-w-md) on void background with ModelPick wordmark"
  - "Server components check getUser() and redirect to /auth/login if unauthenticated"
  - "Client components create Supabase client per-call via createClient() for auth operations"
  - "PKCE callback routes use createServerClient with cookie store for session exchange"

# Metrics
duration: 3min
completed: 2026-02-11
---

# Phase 1 Plan 2: Auth UI & Dashboard Summary

**Auth flow with email/password, Google/GitHub OAuth, magic link, PKCE callback routes, and protected dashboard with empty state CTA and chronological report list**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-02-11T19:04:14Z
- **Completed:** 2026-02-11T19:07:23Z
- **Tasks:** 2
- **Files modified:** 16

## Accomplishments
- Complete authentication UI: login page with email/password + magic link toggle, signup page with email confirmation, social OAuth buttons for Google and GitHub
- PKCE callback routes for OAuth redirect and email confirmation token exchange
- Authenticated app layout with nav bar, user email, "New Benchmark" button, and sign-out
- Dashboard with empty state for new users ("Run your first benchmark" CTA) and chronological report list for returning users
- Reusable Button (3 variants, 3 sizes, loading state) and Card components

## Task Commits

Each task was committed atomically:

1. **Task 1: Shared UI components, auth pages with login/signup forms, social buttons, and callback routes** - `3c58641` (feat)
2. **Task 2: Authenticated app layout and dashboard with empty state and report list** - `0b47ce3` (feat)

## Files Created/Modified
- `src/components/ui/button.tsx` - Reusable button with primary/secondary/ghost variants, sm/md/lg sizes, loading spinner
- `src/components/ui/card.tsx` - Reusable card with header/content sections, dark-warm palette
- `src/components/auth/login-form.tsx` - Client component: email/password login + magic link toggle, inline errors, redirect on success
- `src/components/auth/signup-form.tsx` - Client component: signup with password validation, email confirmation message
- `src/components/auth/social-buttons.tsx` - Client component: Google and GitHub OAuth via signInWithOAuth, loading states
- `src/components/auth/sign-out-button.tsx` - Client component: calls signOut() and redirects to landing
- `src/app/auth/login/page.tsx` - Server component: renders login form + social buttons, redirects if already authenticated
- `src/app/auth/signup/page.tsx` - Server component: renders signup form + social buttons, redirects if already authenticated
- `src/app/auth/callback/route.ts` - GET handler: exchanges OAuth/magic link code for session via PKCE
- `src/app/auth/confirm/route.ts` - GET handler: exchanges email confirmation code for session via PKCE
- `src/app/(app)/layout.tsx` - Server component: auth guard with getUser(), nav bar, user email, sign-out
- `src/app/(app)/dashboard/page.tsx` - Server component: fetches reports, renders empty state or report list
- `src/components/dashboard/empty-state.tsx` - CTA with "Run your first benchmark" and example report link
- `src/components/dashboard/report-card.tsx` - Report summary card with date, top model, cost, model count, status badge
- `src/components/dashboard/report-list.tsx` - Chronological card list with report count heading
- `src/lib/supabase/middleware.ts` - Fixed route protection to match actual URL paths

## Decisions Made
- Fixed middleware route protection: Route groups like `(app)` are not part of the URL path in Next.js. Changed from `startsWith("/(app)")` to matching actual protected paths (`/dashboard`, `/benchmark`). This was a bug in the Plan 01-01 implementation.
- Social buttons placed above the divider ("or"), email/password form below -- follows common patterns (Google, GitHub first) for faster sign-in
- Sign-out button extracted as a separate client component so the app layout can remain a server component that calls `getUser()` for the auth guard
- Auth pages check `getUser()` server-side and redirect already-authenticated users to `/dashboard`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Middleware route group path matching never triggers**
- **Found during:** Task 1 (auth callback routes)
- **Issue:** Middleware checked `request.nextUrl.pathname.startsWith("/(app)")` but Next.js route groups are not part of the URL path. The actual path is `/dashboard`, not `/(app)/dashboard`, so unauthenticated users were never redirected.
- **Fix:** Changed to check actual URL paths: `/dashboard`, `/benchmark`
- **Files modified:** src/lib/supabase/middleware.ts
- **Verification:** Build passes, route table shows `/dashboard` as dynamic (not `/(app)/dashboard`)
- **Committed in:** 3c58641 (Task 1 commit)

**2. [Rule 2 - Missing Critical] Sign-out button client component not in plan**
- **Found during:** Task 2 (app layout)
- **Issue:** Plan specified "Sign Out button" in the server-component app layout but `supabase.auth.signOut()` is a client-side operation. Needed a client component.
- **Fix:** Created `src/components/auth/sign-out-button.tsx` as a "use client" component
- **Files modified:** src/components/auth/sign-out-button.tsx (new file)
- **Verification:** Build passes, sign-out button renders in nav
- **Committed in:** 0b47ce3 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 missing critical)
**Impact on plan:** Both fixes essential for correctness. Middleware bug would have left all protected routes unprotected. Sign-out requires client-side Supabase call. No scope creep.

## Issues Encountered
None -- both tasks built and compiled on first attempt.

## User Setup Required

Per Plan 01-01 user setup (still pending):
- Configure Supabase project with OAuth providers (Google, GitHub)
- Add redirect URLs: `http://localhost:3000/auth/callback`
- Run database migration in Supabase SQL Editor

## Next Phase Readiness
- Auth UI complete, ready for end-to-end testing once Supabase is configured
- Dashboard renders empty state immediately, report list ready when data exists
- Button and Card components available for wizard UI (Plan 01-03)
- App layout provides authenticated shell for all future `(app)` routes

## Self-Check: PASSED

All 16 key files verified present. Both task commits (3c58641, 0b47ce3) verified in git log. All must_have artifact min_lines thresholds met. All key_links patterns (exchangeCodeForSession, getUser, router.push.*dashboard, signInWithOAuth) verified in source.

---
*Phase: 01-configure-benchmark*
*Completed: 2026-02-11*
