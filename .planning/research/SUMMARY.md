# Project Research Summary

**Project:** ModelPick - Paid Vision Model Benchmarking SaaS
**Domain:** One-shot benchmarking report for structured data extraction from images
**Researched:** 2026-02-11
**Confidence:** HIGH

## Executive Summary

ModelPick is a $14.99 one-shot service that tests ~20 vision models on user-uploaded images to determine which model best extracts structured JSON data. Users upload 3 sample images with expected JSON outputs, configure a testing plan, pay via Stripe, and receive a comprehensive report ranking models on accuracy, cost, and speed with field-level error analysis. The critical technical challenge is orchestrating 1,000+ parallel vision API calls through OpenRouter, streaming progress via Server-Sent Events, and rendering results -- all within Vercel's Fluid Compute constraints.

The recommended approach is a single Vercel Function (Fluid Compute, 800s max) using Next.js 16 App Router, Supabase for database/storage/realtime, and the Vercel AI SDK with OpenRouter for model orchestration. The architecture uses per-model concurrency limiters (5 concurrent per model across 20 models) with adaptive backoff, database-backed persistence for crash recovery, and Supabase Realtime for decoupled progress delivery. This fits comfortably within Vercel's limits at 1-2 minute execution times for typical benchmarks.

The primary risk is binary exact-match JSON comparison producing misleading zero-percent scores due to formatting differences (number formatting, key ordering, whitespace). This must be solved with a canonicalization pipeline before any user sees a report. Secondary risks include OpenRouter rate limit cascades (requires provider-aware concurrency grouping), payment-benchmark decoupling failures (requires separate webhook handling and idempotency), and SSE buffering on Vercel (requires specific Response patterns with headers). All critical pitfalls have clear prevention strategies verified through official documentation.

## Key Findings

### Recommended Stack

The stack centers on Next.js 16 with App Router (React 19 with stable React Compiler, Turbopack by default), Supabase for all backend services (Postgres, Auth, Storage, Realtime), Stripe for payments, and the Vercel AI SDK v6 with OpenRouter for unified vision model access. This combination provides type-safe structured output extraction via Zod schemas, eliminates the need for separate auth/storage/database services, and handles 1,000+ concurrent API calls within a single Vercel Function.

**Core technologies:**
- **Next.js 16.1.x + React 19.2.x**: App Router with Server Components, Route Handlers for SSE, Server Actions for Stripe checkout, React Compiler 1.0 for auto-memoization
- **Vercel AI SDK 6.0.x + OpenRouter provider**: Unified LLM interface with `generateText` and structured output via Zod schemas, single API key for 300+ models including vision
- **Supabase (Postgres + Auth + Storage + Realtime)**: Single platform eliminating separate services, PostgREST v14 for 20% more RPS, Realtime for progress delivery without custom WebSocket infrastructure
- **p-queue 9.1.x**: Promise queue with concurrency control and event emitters essential for tracking 1,000+ API call progress (p-limit lacks introspection)
- **Stripe (Node SDK 20.3.x)**: Server-side Checkout Session creation, webhook verification for payment confirmation, one-time $14.99 payment mode
- **Zod 4.3.x**: Schema validation for AI SDK structured output, API request validation, and database insert validation -- single source of truth
- **Tailwind CSS 4.1.x + Native SSE**: CSS-based charts (no Recharts), native Web APIs for SSE (no library needed), lucide-react for icons
- **json-diff-ts 4.8.x**: TypeScript-first JSON diffing for field-level error analysis (alternative: custom 50-line recursive diff)

**Critical version requirements:**
- Next.js 16.1+ for stable cacheLife/cacheTag
- AI SDK 6.0+ (generateObject deprecated, use generateText with output parameter)
- @supabase/ssr 0.8.x (auth-helpers-nextjs deprecated)
- p-queue (ESM-only, works in Next.js App Router by default)

### Expected Features

ModelPick occupies an empty middle in the competitive landscape: paid but cheap ($14.99), specific (vision + structured extraction), zero-setup (web form), and uniquely shows field-level error diffs on YOUR data. Free leaderboards (Artificial Analysis, OmniAI) use generic benchmarks with no custom data testing. Paid evaluation platforms (Vellum, Braintrust, Roboflow) are subscription-based ($249+/mo) aimed at teams. No direct competitor sells one-shot paid benchmarking reports for vision model structured extraction.

**Must have (table stakes):**
- Image upload with preview (drag-and-drop, JPG/PNG/WebP/PDF support)
- Expected JSON input with live syntax validation and error highlighting
- Stripe Checkout (hosted page, not inline form) for trust and simplicity
- Real-time progress during benchmark (1-2 minutes, user needs reassurance)
- Ranked results table sortable by accuracy, cost, speed with P50/P95 metrics
- Shareable report link (unique URL, no auth required)
- Email receipt with report link for retrieval
- Binary exact-match accuracy metric (the core value proposition)
- Mobile-responsive report (many users open shared links on mobile)

**Should have (competitive advantage):**
- **"Where It Missed" field-level error diffs**: The killer feature -- no leaderboard shows exactly which JSON field a model gets wrong and what it returned instead (expandable per-model with side-by-side diff)
- **YOUR data, not generic benchmarks**: The gap between "GPT-4o scores 92% on MMMU" and "GPT-4o scores 78% on MY receipt format" is the entire value proposition
- **Bubble chart visualization**: Four dimensions (x=cost, y=accuracy, size=speed, opacity=consistency) for YOUR use case results
- **Cost calculator with "switching saves $X/month"**: Turns abstract data into concrete business decision
- **Relaxed matching toggle**: Binary exact-match is strict; toggle between strict and relaxed modes (whitespace normalization, number formatting)
- **Aggregated error patterns**: "Claude Haiku misses the tax field 30% of the time" across all runs
- **PDF export**: Some users need to attach reports to procurement decisions
- **OpenRouter baseline comparison**: "Your benchmark took 2.1s median, but OpenRouter's global median is 1.4s"

**Defer (v2+):**
- Configurable testing plan wizard (start with fixed 20 models x 50 runs for simplicity)
- Internal generic leaderboard (requires ongoing API spend and infrastructure)
- Batch documents (10+ images, changes pricing model)
- A/B prompt testing (different product -- prompt engineering tool, not model benchmarking)
- Team accounts / collaboration (shareable links solve 80% of this)
- Enterprise features (SSO, audit logs -- wrong market)

**Anti-features (commonly requested, problematic):**
- Bring-your-own API keys (eliminates business model)
- Real-time model monitoring/dashboards (turns one-shot into infrastructure platform)
- Non-vision text-only LLM benchmarking (crowded space, dilutes focus)
- Custom evaluation metrics / LLM-as-judge (over-engineers the product)

### Architecture Approach

The architecture uses a single long-running Vercel Function (Fluid Compute, 800s max) that orchestrates 20 model workers running in parallel. Each model worker uses p-queue with concurrency 5 to manage 50 API calls per model, writing results to Supabase Postgres immediately for crash recovery. Clients receive progress updates via Supabase Realtime (postgres_changes subscription) rather than direct SSE from the benchmark function, fully decoupling execution from progress delivery. The benchmark completes in 1-2 minutes for typical workloads, well within Vercel's limits.

**Major components:**
1. **Upload Form + Stripe Checkout**: Client uploads images to Supabase Storage via signed URLs (bypasses Vercel 4.5MB body limit), creates report record with status `pending_payment`, redirects to Stripe Checkout hosted page
2. **Webhook Handler**: Verifies Stripe signature, updates report status to `paid`, triggers benchmark start via internal fetch (does NOT run benchmark synchronously)
3. **Benchmark Orchestrator**: Coordinates 20 model workers via Promise.allSettled, each worker with per-model p-queue(5) and adaptive backoff on 429s, writes each run to database immediately, sends completion email via Resend
4. **Model Worker**: Runs 50 API calls (3 images x ~17 runs each) for one model using AI SDK generateText with structured output, handles provider-specific rate limits with exponential backoff + jitter, computes model summary statistics
5. **Supabase Realtime Bridge**: Client subscribes to postgres_changes on model_results table filtered by report_id, receives updates as each model completes (decoupled from benchmark function lifetime)
6. **Report Generator**: Server Component fetches report + model_results + benchmark_runs from Supabase, renders ranked table (RSC), bubble chart (client component), error diffs (client component, lazy loaded), cost calculator (client component)

**Key architectural decisions:**
- Single function, not distributed workflow (1-2 min runtime fits within 800s limit)
- Per-model semaphore (p-queue(5)), not global concurrency pool (prevents cross-model rate limit collisions)
- Supabase Realtime for progress, not custom SSE (decoupled, crash-resilient, free)
- Write each run immediately, not batch (crash recovery + real-time progress)
- Image upload via Supabase Storage signed URLs, not base64 in API payloads (bypasses size limits, reduces bandwidth 33%)
- Payment trigger via webhook, not success page redirect (guaranteed delivery, idempotent)

### Critical Pitfalls

Research identified 10 critical and moderate pitfalls with clear prevention strategies:

1. **Binary Exact-Match Accuracy Produces Misleading Zero-Percent Scores**: LLMs produce JSON with unpredictable formatting (number formatting `42.5` vs `"42.50"`, key ordering, whitespace). Implement canonicalization pipeline (parse, sort keys, normalize numbers/whitespace, re-serialize) as DEFAULT mode. Always show field-level diff regardless of pass/fail. This is the single biggest risk to the value proposition.

2. **OpenRouter Rate Limits Cause Cascading Failures**: Sending 100 concurrent requests through one API key triggers balance-based rate limits ($1 = 1 RPS). Use provider-aware concurrency groups (all Anthropic models share one semaphore, all OpenAI models share another), global RPS budget with token bucket, exponential backoff with jitter per provider group, circuit breaker per model after 3 consecutive 429s.

3. **Payment Succeeds But Benchmark Fails -- No Recovery Path**: User pays $14.99, benchmark crashes midway, no report and no recovery. Decouple payment from execution (webhook only creates pending record, separate trigger starts benchmark), implement idempotent execution (check if started/completed), persist per-model results incrementally, provide manual retry mechanism, guard against duplicate webhook delivery with event.id storage.

4. **SSE Streaming Breaks Silently on Vercel Due to Buffering**: Next.js buffers Response body, chunks arrive all-at-once. Return Response immediately with ReadableStream, set `dynamic='force-dynamic'`, use `X-Accel-Buffering: no` header, send periodic heartbeat. Better: use Supabase Realtime (postgres_changes) for decoupled progress delivery.

5. **API Cost Budget Overrun Destroys Unit Economics**: Fixed ~$7 estimate but actual costs vary (variable token counts, image tokenization differences, verbose outputs, retries). Track real-time cost from OpenRouter response headers with running total, allocate budget by tier, set max_tokens cap, fetch current pricing before benchmark, store actual cost per report with alerts when average exceeds $6 or any single report exceeds $9.

**Additional moderate pitfalls:**
- Vercel 800s timeout includes cold starts and waiting time (set maxDuration=800, internal timeout at 700s)
- Structured output support varies wildly across models (maintain per-model capability lookup, tiered extraction strategy)
- Image handling complexity (normalize server-side: convert to JPEG 85% quality, resize to 2048px, use URL-based input not base64)
- OpenRouter model availability changes without notice (pre-flight health check, model registry with daily cron verification)
- SSE client disconnection leaves orphaned runs (always persist to database independent of SSE, use EventSource for auto-reconnect)

## Implications for Roadmap

Based on research, suggested phase structure prioritizes foundation-first, then payment pipeline, then benchmark engine, then polish. The critical path is: database schema → upload flow → payment → benchmark engine → progress delivery → report rendering.

### Phase 1: Foundation + Upload Pipeline
**Rationale:** Everything depends on database schema and image handling. Image normalization must be solved before benchmark engine connects to OpenRouter.
**Delivers:** Supabase project setup (schema, auth, storage, RLS), Next.js App Router skeleton, image upload with preview, JSON input validation, image normalization pipeline (format conversion, resize, URL-based storage)
**Addresses:** Image upload (table stakes), JSON validation (table stakes), image handling complexity (pitfall 8)
**Avoids:** Base64 payload bloat, unsupported image formats, bypasses Vercel body size limits

### Phase 2: Payment Pipeline
**Rationale:** Users cannot generate reports without paying. Payment-to-benchmark flow is the most critical business logic -- build with failure recovery from day one.
**Delivers:** Stripe Checkout integration (session creation, hosted page), webhook handler (signature verification, idempotency guard, status update), payment-benchmark decoupling (webhook creates pending record, separate trigger), payment record storage
**Addresses:** Stripe Checkout (table stakes), email receipt (table stakes)
**Avoids:** Payment succeeds but benchmark fails (pitfall 3), duplicate webhook processing, synchronous execution in webhook handler

### Phase 3: Benchmark Engine (Core Product)
**Rationale:** The benchmark engine is the product. Depends on Supabase for persistence and payment flow to trigger runs. This is the highest complexity phase.
**Delivers:** OpenRouter client (API wrapper, model registry, cost tracking), model worker (per-model p-queue(5), adaptive backoff, result persistence), benchmark orchestrator (coordinates 20 workers, manages report lifecycle), JSON canonicalization + diff engine (field-level comparison), provider-aware concurrency grouping, real-time cost tracking with budget ceiling
**Addresses:** Binary accuracy (table stakes), ranked table (table stakes), field-level error diffs (killer feature), cost per run (table stakes)
**Avoids:** Binary exact-match too strict (pitfall 1), OpenRouter rate limit cascade (pitfall 2), API cost overrun (pitfall 5), structured output variance (pitfall 7)

### Phase 4: Real-Time Progress + Report
**Rationale:** Progress tracking and report rendering depend on benchmark engine producing data. Supabase Realtime eliminates need for custom SSE infrastructure.
**Delivers:** Supabase Realtime subscription (client-side progress tracking), processing page (real-time progress UI with model-by-model completion), report statistics computation (accuracy, P50, P95, IQR, rankings), report page (ranked table, bubble chart, error diffs, cost calculator), shareable report link (UUID-based, no auth required), email notification (Resend integration)
**Addresses:** Real-time progress (table stakes), shareable link (table stakes), bubble chart (competitive advantage), cost calculator (competitive advantage), aggregated error patterns (competitive advantage)
**Avoids:** SSE buffering (pitfall 4), client disconnection orphans (pitfall 10)

### Phase 5: Polish + Launch
**Rationale:** Polish depends on all core features being functional. Landing page and error handling are final pre-launch tasks.
**Delivers:** Landing page (marketing, example report, pricing), error handling + edge cases (timeout recovery, partial reports, refund flow), mobile-responsive report, relaxed matching toggle, PDF export (can defer to post-MVP)
**Addresses:** Mobile-responsive (table stakes), relaxed matching (competitive advantage), PDF export (competitive advantage)

### Phase Ordering Rationale

- **Foundation first**: Database schema and image handling are prerequisites for everything else. No other work can proceed without these.
- **Payment before benchmark**: Users must pay before running reports. Payment flow must be bulletproof (idempotent, failure-recovering) because it is the revenue gate.
- **Benchmark engine as phase 3**: This is the longest phase with highest complexity. Depends on foundation and payment infrastructure. Cannot be split into smaller phases without creating artificial boundaries.
- **Progress + Report after benchmark**: No point building progress UI or report rendering until the engine produces data to display.
- **Polish last**: Error handling, edge cases, and marketing pages require a functional product underneath.

The phasing avoids anti-patterns identified in ARCHITECTURE.md: no global concurrency limiter (each phase builds per-model semaphores), no SSE coupling to benchmark function (phase 4 uses Supabase Realtime), no synchronous webhook execution (phase 2 decouples payment from execution), no batch-only result persistence (phase 3 writes incrementally).

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Benchmark Engine)**: Complex OpenRouter integration with provider-specific rate limiting, AI SDK structured output across 20 models with varying support levels, canonicalization heuristics for JSON comparison
- **Phase 2 (Payment Pipeline)**: Stripe webhook reliability patterns, idempotency strategies, error recovery workflows

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation + Upload)**: Well-documented Supabase setup, standard Next.js App Router patterns, image normalization is solved problem
- **Phase 4 (Real-Time + Report)**: Supabase Realtime is documented official pattern, report rendering is standard React
- **Phase 5 (Polish)**: Standard web development tasks

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technologies verified via official docs, version compatibility matrix complete, deployment infrastructure proven |
| Features | MEDIUM | No direct competitor exists, so features synthesized from adjacent products (evaluation platforms, leaderboards, OCR benchmarking tools). MVP feature list is validated but post-MVP prioritization needs user feedback. |
| Architecture | HIGH | Single-function architecture math verified (1-2 min execution within 800s limit), Vercel Fluid Compute limits documented, per-model concurrency pattern proven, Supabase Realtime official integration |
| Pitfalls | HIGH | Most pitfalls verified via official docs + multiple sources. Binary comparison issue is domain-standard problem with established solutions. Rate limiting documented by OpenRouter. SSE buffering confirmed via community consensus and Medium article. |

**Overall confidence:** HIGH

Research provides clear technology choices, architectural patterns, feature priorities, and pitfall prevention strategies. The primary uncertainty is post-MVP feature prioritization (which competitive advantages resonate most with users), but the MVP scope is well-defined.

### Gaps to Address

Areas where research was inconclusive or needs validation during implementation:

- **JSON canonicalization heuristics**: The exact normalization rules (how to handle null vs missing, array ordering when order is semantically irrelevant, date format variations) need to be refined based on real model outputs. Start with conservative canonicalization (parse, sort keys, normalize whitespace) and expand based on user feedback.

- **OpenRouter model lineup changes**: The 20-model lineup assumes current availability. Model deprecations, pricing changes, and new model releases will require ongoing maintenance. Build the model registry as a database table (not hardcoded) with a daily health check cron job from day one.

- **Actual API cost distribution**: The $7 budget estimate is based on OpenRouter pricing as of 2026-02-11. Real costs will vary based on image resolution, output verbosity, and model-specific tokenization. Phase 3 must track actual costs per report from the first real benchmark and alert on budget drift.

- **SSE vs Supabase Realtime latency**: Research recommends Supabase Realtime for simplicity and decoupling, but latency is ~100-200ms vs ~0ms for direct SSE. If user feedback indicates progress updates feel laggy, this can be revisited in post-MVP optimization.

- **Relaxed matching adoption rate**: Research assumes strict exact-match as default with relaxed toggle as option. If >50% of users enable relaxed matching, this indicates the default should be flipped. Monitor usage post-launch.

## Sources

### Primary (HIGH confidence)
- [Next.js 16 blog post](https://nextjs.org/blog/next-16) - v16 features, React Compiler stable, Turbopack default
- [Next.js 16.1 blog post](https://nextjs.org/blog/next-16-1) - cacheLife/cacheTag stable
- [Vercel Fluid Compute docs](https://vercel.com/docs/fluid-compute) - duration limits verified: Hobby 300s, Pro/Enterprise 800s max
- [Vercel Functions Limits](https://vercel.com/docs/functions/limitations) - 1,024 file descriptor limit, 4.5MB body limit, 4GB max memory on Pro
- [OpenRouter rate limits docs](https://openrouter.ai/docs/api/reference/limits) - dynamic rate limiting, $1 = 1 RPS
- [OpenRouter Structured Outputs](https://openrouter.ai/docs/guides/features/structured-outputs) - model-specific support documentation
- [Supabase JS releases](https://github.com/supabase/supabase-js/releases) - verified v2.95.3
- [Supabase SSR package](https://supabase.com/docs/guides/auth/server-side/creating-a-client) - createBrowserClient/createServerClient pattern
- [AI SDK 6 introduction](https://ai-sdk.dev/docs/introduction) - verified v6.0.78
- [AI SDK 6 migration guide](https://ai-sdk.dev/docs/migration-guides/migration-guide-6-0) - generateObject deprecated, use generateText with output
- [Stripe Checkout quickstart](https://docs.stripe.com/checkout/quickstart?client=next) - Next.js integration
- [p-queue npm](https://www.npmjs.com/package/p-queue) - verified v9.1.0, ESM-only, events API

### Secondary (MEDIUM confidence)
- [Artificial Analysis - AI Model Comparison](https://artificialanalysis.ai/models) - Free platform comparing AI models, no custom data testing
- [OmniAI OCR Benchmark (GitHub)](https://github.com/getomni-ai/benchmark) - Open-source OCR benchmark, JSON diff-based accuracy
- [Cleanlab Structured Output Benchmark](https://cleanlab.ai/blog/tlm-structured-outputs-benchmark/) - Field-level trust scores for structured outputs
- [Fixing Slow SSE Streaming in Next.js and Vercel](https://medium.com/@oyetoketoby80/fixing-slow-sse-server-sent-events-streaming-in-next-js-and-vercel-99f42fbdb996) - Buffering fix with Content-Encoding: none
- [Next.js SSE Discussion #48427](https://github.com/vercel/next.js/discussions/48427) - Community-verified patterns for ReadableStream SSE

### Tertiary (LOW confidence)
- [Vercel Community: SSE ReadableStream cancel issue](https://community.vercel.com/t/server-sent-events-readablestream-not-calling-cancel-method/10291) - Community report, not officially confirmed

---
*Research completed: 2026-02-11*
*Ready for roadmap: yes*
