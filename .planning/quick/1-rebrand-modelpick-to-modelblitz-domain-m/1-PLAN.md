---
phase: quick
plan: 1
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - src/lib/config/constants.ts
  - src/app/layout.tsx
  - src/app/(marketing)/layout.tsx
  - src/app/(app)/layout.tsx
  - src/app/auth/login/page.tsx
  - src/app/auth/signup/page.tsx
  - src/emails/report-ready.tsx
  - src/lib/email/send-report-ready.ts
  - src/lib/benchmark/runner.ts
  - src/app/api/checkout/route.ts
autonomous: true
must_haves:
  truths:
    - "Every user-visible occurrence of 'ModelPick' now reads 'ModelBlitz'"
    - "Every fallback URL referencing modelpick.com now references modelblitz.com"
    - "The styled wordmark uses Model<ember>Blitz</ember> consistently"
    - "The app builds without errors after renaming"
  artifacts:
    - path: "src/lib/config/constants.ts"
      provides: "APP_NAME constant"
      contains: "ModelBlitz"
    - path: "src/app/layout.tsx"
      provides: "Root metadata title"
      contains: "ModelBlitz"
    - path: "src/emails/report-ready.tsx"
      provides: "Email template with new brand"
      contains: "ModelBlitz"
  key_links:
    - from: "src/lib/config/constants.ts"
      to: "all files"
      via: "APP_NAME export (currently unused but sets canonical name)"
      pattern: 'APP_NAME = "ModelBlitz"'
---

<objective>
Rebrand every occurrence of "ModelPick" / "modelpick" to "ModelBlitz" / "modelblitz" across the entire codebase source files. The user has purchased modelblitz.com and wants the product name updated everywhere.

Purpose: Align codebase with the new brand and domain before any public deployment.
Output: All source files updated, build passes, no remaining references to the old name.
</objective>

<execution_context>
@/Users/lukelibraro/.claude/get-shit-done/workflows/execute-plan.md
@/Users/lukelibraro/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/lib/config/constants.ts
@src/app/layout.tsx
@src/app/(marketing)/layout.tsx
@src/app/(app)/layout.tsx
@src/app/auth/login/page.tsx
@src/app/auth/signup/page.tsx
@src/emails/report-ready.tsx
@src/lib/email/send-report-ready.ts
@src/lib/benchmark/runner.ts
@src/app/api/checkout/route.ts
@package.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update all source file brand references from ModelPick to ModelBlitz</name>
  <files>
    src/lib/config/constants.ts
    src/app/layout.tsx
    src/app/(marketing)/layout.tsx
    src/app/(app)/layout.tsx
    src/app/auth/login/page.tsx
    src/app/auth/signup/page.tsx
    src/emails/report-ready.tsx
    src/lib/email/send-report-ready.ts
    src/lib/benchmark/runner.ts
    src/app/api/checkout/route.ts
    package.json
  </files>
  <action>
    Perform a systematic find-and-replace across all source files. The replacements are:

    **constants.ts:**
    - `APP_NAME = "ModelPick"` -> `APP_NAME = "ModelBlitz"`

    **layout.tsx (root):**
    - `title: "ModelPick"` -> `title: "ModelBlitz"`

    **marketing/layout.tsx, (app)/layout.tsx, auth/login/page.tsx, auth/signup/page.tsx** (4 files with styled wordmark):
    - `Model<span className="text-ember">Pick</span>` -> `Model<span className="text-ember">Blitz</span>`

    **emails/report-ready.tsx:**
    - Default prop: `"https://modelpick.com/report/demo"` -> `"https://modelblitz.com/report/demo"`
    - Preview text: `"Your ModelPick benchmark report is ready"` -> `"Your ModelBlitz benchmark report is ready"`
    - Logo text: `<Text style={logo}>ModelPick</Text>` -> `<Text style={logo}>ModelBlitz</Text>`
    - Footer: `"You received this email because you purchased a ModelPick"` -> `"You received this email because you purchased a ModelBlitz"`

    **send-report-ready.ts:**
    - Mock subject: `"Your ModelPick Benchmark Report is Ready"` -> `"Your ModelBlitz Benchmark Report is Ready"`
    - Fallback URL: `"https://modelpick.com"` -> `"https://modelblitz.com"`
    - Fallback from: `"ModelPick <onboarding@resend.dev>"` -> `"ModelBlitz <onboarding@resend.dev>"`
    - Real subject: `"Your ModelPick Benchmark Report is Ready"` -> `"Your ModelBlitz Benchmark Report is Ready"`

    **benchmark/runner.ts:**
    - Fallback URL: `"https://modelpick.com"` -> `"https://modelblitz.com"`
    - X-Title header: `"ModelPick"` -> `"ModelBlitz"`

    **api/checkout/route.ts:**
    - Product name: `"ModelPick Benchmark Report"` -> `"ModelBlitz Benchmark Report"`

    **package.json:**
    - `"name": "modelpick"` -> `"name": "modelblitz"`

    Do NOT update package-lock.json manually -- it will regenerate. Do NOT update files in .planning/ or docs/ directories (those are historical records).
  </action>
  <verify>
    1. Run: `grep -ri "modelpick\|ModelPick" src/ package.json` -- should return zero results
    2. Run: `npm run build` -- should complete without errors
    3. Run: `npm test` -- should pass (if tests exist)
  </verify>
  <done>
    - Zero occurrences of "ModelPick" or "modelpick" in any file under src/ or in package.json
    - All replacements use "ModelBlitz" / "modelblitz" consistently (capital B in Blitz)
    - The app builds successfully
    - All styled wordmarks read Model<ember>Blitz</ember>
  </done>
</task>

</tasks>

<verification>
- `grep -ri "modelpick" src/ package.json` returns no matches
- `npm run build` succeeds
- `npm test` passes (if applicable)
- Spot-check: `src/lib/config/constants.ts` has `APP_NAME = "ModelBlitz"`
- Spot-check: `src/app/layout.tsx` has `title: "ModelBlitz"`
- Spot-check: `src/emails/report-ready.tsx` has `ModelBlitz` in logo, preview, footer
</verification>

<success_criteria>
Every user-facing and system-facing reference to "ModelPick" / "modelpick" in source code is replaced with "ModelBlitz" / "modelblitz". The build passes. The styled wordmark consistently uses Model + Blitz with ember highlighting on "Blitz".
</success_criteria>

<output>
After completion, create `.planning/quick/1-rebrand-modelpick-to-modelblitz-domain-m/1-SUMMARY.md`
</output>
