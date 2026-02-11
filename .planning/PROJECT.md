# ModelPick

## What This Is

ModelPick is a one-shot paid benchmarking report for structured data extraction from images. Users upload sample images (receipts, invoices, documents) with their correct JSON output and extraction prompt, pay $14.99, and receive a statistically rigorous report ranking vision models on accuracy, cost, and speed — with exact field-level diffs showing where each model fails. Target audience is micro-SaaS founders, indie hackers, and small AI startups building extraction pipelines.

## Core Value

Users can see exactly which vision model extracts their specific document data most accurately and cheaply — with field-level error diffs showing precisely where each model fails — so they stop overpaying for GPT-4o when a $0.002/call model gets 96% accuracy on their use case.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] User can sign up, log in (email/password, social, magic link) and access past reports
- [ ] User can upload 1-10 sample images with correct JSON output for each
- [ ] User can provide an extraction prompt (system infers JSON schema from examples, user can override)
- [ ] User is guided through a testing plan wizard that allocates a ~$7 API budget based on their priorities (accuracy vs speed vs cost, model selection strategy, number of samples)
- [ ] System optimizes runs-per-model internally to maximize statistical confidence within budget
- [ ] System benchmarks selected vision models via OpenRouter with parallel execution
- [ ] Results stream to the user in real-time via SSE as each model completes
- [ ] Report displays ranked table (accuracy, cost/run, median RT, P95 RT, spread)
- [ ] Report includes bubble chart visualization (cost vs accuracy, bubble size = P95, opacity = consistency)
- [ ] Report includes "Where It Missed" field-level error diffs per model with aggregated error patterns
- [ ] Report includes top recommendation with rationale
- [ ] Report includes cost calculator (queries/day input, current vs recommended model comparison)
- [ ] Binary exact-match accuracy by default with toggle for relaxed matching (normalize whitespace, formatting)
- [ ] User pays $14.99 via Stripe Checkout before benchmarks run
- [ ] Report has shareable link (unique URL) and PDF export
- [ ] User can access all past reports from their dashboard

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- $7.50/mo subscription for new-model updates — post-launch, validate demand for one-time reports first
- User accounts for teams/organizations — individual accounts only for MVP
- Bring-your-own API keys — we manage all API access via OpenRouter
- Non-vision/text-only benchmarking — future expansion, not MVP
- Self-hosted/on-prem deployment — SaaS only
- Enterprise features (SSO, audit logs, compliance) — not the target market
- Fuzzy/semantic accuracy scoring — binary exact-match is the differentiator (relaxed matching is cosmetic normalization, not semantic)
- Mobile app — web-first
- Real-time model monitoring — this is a one-shot report, not a dashboard
- Custom model selection (user picking arbitrary models) — use curated sets from our leaderboard for MVP

## Context

- **Existing prototype:** Visual mockup in this repo (React/Vite) showing report layout. Reference only — building fresh with Next.js.
- **Domain:** modelpick.ai
- **Revenue target:** $2-3k/mo passive income
- **Competitive gap:** No tool shows field-level error diffs for vision model structured extraction. Existing benchmarks test generic tasks, not the user's specific document format.
- **Key insight from PRD:** Most builders use GPT-4o for everything and overpay 3-10x because testing 20 models manually is tedious.
- **Internal leaderboard:** ModelPick will maintain its own generic structured-extraction benchmark data to power the "balanced" model selection preset in the wizard.
- **Unit economics:** $14.99 price, ~$7 API cost budget, ~50% margin after Stripe fees.

## Constraints

- **Tech stack:** Next.js (App Router) + TypeScript + Tailwind CSS, deployed all-in-one on Vercel (Fluid Compute for long-running benchmarks)
- **Auth + DB:** Supabase (Auth with social/email/magic link + Postgres)
- **API routing:** OpenRouter for all vision model calls (single API, 20 models)
- **Payments:** Stripe Checkout, one-time $14.99
- **Streaming:** SSE (Server-Sent Events), not WebSocket — Vercel doesn't support WebSocket
- **Charts:** CSS-based bubble/scatter plots (Recharts ScatterChart is broken in this stack)
- **Execution time:** Benchmark runs must complete within Vercel Fluid Compute limits (800s on Pro)
- **Budget per report:** ~$7 OpenRouter API cost ceiling, system optimizes allocation within this budget
- **Design:** Dark-warm palette — orange primary `#F97316` on void `#0A0A0B`, Inter + JetBrains Mono, "Stripe Checkout simplicity"

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full-stack TypeScript (not Python/FastAPI) | Single language, simpler deployment, shared types | — Pending |
| All-in-one Vercel deploy with Fluid Compute | Simple deployment, benchmark runs fit within 800s limit | — Pending |
| SSE instead of WebSocket for streaming | Vercel doesn't support WebSocket; SSE is sufficient for one-directional result streaming | — Pending |
| Supabase for auth + DB (not SQLite/custom) | Built-in social/magic link auth, Postgres, row-level security | — Pending |
| Configurable testing plan wizard (not fixed 3×50×20) | Users allocate ~$7 budget across priorities; system optimizes runs-per-model internally | — Pending |
| Progressive disclosure for inputs | User provides images + JSON + prompt; system infers schema with override option | — Pending |
| Binary exact-match with relaxed toggle | Strict matching is the differentiator; relaxed mode normalizes formatting only, not semantics | — Pending |
| Fresh start from prototype | Existing codebase is visual mockup only; build clean Next.js project, reference prototype for design | — Pending |
| No subscription in MVP | Validate one-time report demand before building recurring billing | — Pending |
| Internal generic leaderboard | Powers "balanced" model preset in wizard; also serves as marketing content | — Pending |

---
*Last updated: 2026-02-11 after initialization*
