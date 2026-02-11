# Stack Research

**Domain:** Paid one-shot benchmarking report SaaS (vision model structured data extraction)
**Researched:** 2026-02-11
**Confidence:** HIGH

## Context

ModelPick is a $14.99 one-shot service. Users upload images + expected JSON + an extraction prompt, configure a testing plan, pay via Stripe, and receive a report ranking ~20 vision models on accuracy/cost/speed with field-level error diffs.

The critical technical challenge: orchestrating 1,000+ parallel vision API calls through OpenRouter, streaming progress via SSE, and rendering results -- all within Vercel's Fluid Compute constraints.

Stack decisions already locked: Next.js App Router, Supabase, Stripe Checkout, OpenRouter, SSE (not WebSocket), CSS-based charts, TypeScript, Tailwind CSS v4, dark-warm palette.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| Next.js | 16.1.x | Full-stack React framework | App Router is the standard for new projects. Turbopack stable by default for dev and build. React Compiler stable (auto-memoization). cacheLife/cacheTag stable. Route Handlers for SSE streaming. Server Actions for Stripe checkout flow. | HIGH |
| React | 19.2.x | UI library | Bundled with Next.js 16. React Compiler 1.0 eliminates manual useMemo/useCallback. Server Components reduce client bundle for the report page. | HIGH |
| TypeScript | ~5.9.x | Type safety | Already in prototype. Use strict mode. Zod schemas for runtime validation pair perfectly with TS compile-time types. | HIGH |

### Database and Auth

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| Supabase (hosted) | Latest cloud | Postgres + Auth + Storage + Realtime | Single platform for auth, database, and image storage. Row Level Security for multi-tenant data isolation. PostgREST v14 gives ~20% more RPS. No separate auth service needed. | HIGH |
| @supabase/supabase-js | ^2.95.x | Browser/server JS client | Single client for all Supabase services. Isomorphic -- works in Server Components, Route Handlers, and client. | HIGH |
| @supabase/ssr | ^0.8.x | SSR auth helpers | Required for Next.js App Router cookie-based auth. Replaces deprecated @supabase/auth-helpers-nextjs. Creates server/client Supabase instances with proper cookie handling. | HIGH |

### Payments

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| stripe (Node SDK) | ^20.3.x | Server-side Stripe API | Create Checkout Sessions from Server Actions. Verify webhooks for payment confirmation. API version 2026-01-28.clover. One-time $14.99 payment -- Checkout Session in "payment" mode, not "subscription". | HIGH |
| @stripe/stripe-js | latest | Client-side Stripe | Only needed if using Stripe Elements. For Stripe Checkout (hosted page redirect), this is optional. Recommend Stripe-hosted Checkout to avoid PCI scope. | MEDIUM |

### AI / Vision Model Orchestration

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| ai (Vercel AI SDK) | ^6.0.x | Unified LLM interface | `generateText` with `Output.object({ schema })` gives type-safe structured extraction using Zod schemas. Handles streaming, retries, provider abstraction. The new v6 API replaces deprecated `generateObject`/`streamObject`. | HIGH |
| @openrouter/ai-sdk-provider | ^2.1.x | OpenRouter provider for AI SDK | Official OpenRouter provider. Single API key, 300+ models. Swap model IDs without code changes. Vision/multimodal support built in. | HIGH |
| zod | ^4.3.x | Schema validation | Define extraction schemas once, use for: AI SDK structured output, API request validation, form validation, database insert validation. Zod 4 is current (released 2025). 75M weekly downloads. | HIGH |

### Concurrency and Job Orchestration

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| p-queue | ^9.1.x | Promise queue with concurrency control | Rate-limit parallel OpenRouter calls. Set concurrency to ~20-30 (safe within OpenRouter's dynamic rate limits). Supports pause/resume, priority, events (for progress tracking). ESM-only. | HIGH |

**Why p-queue over p-limit:** p-queue provides event emitters (`idle`, `add`, `next`, `completed`, `error`) that are essential for streaming progress updates. p-limit is just a concurrency limiter with no introspection. For 1,000+ calls where you need to report "247 of 1000 complete", p-queue's events are required.

**Why not Inngest/Trigger.dev:** These are background job platforms for long-running work that exceeds Vercel limits. But Vercel Fluid Compute on Pro gives 800s (13 min) max duration. Running 1,000 vision API calls at concurrency 25, with ~2-5s per call, means ~80-200s total. This fits within Fluid Compute. Adding a third-party job queue adds deployment complexity, cost, and another failure point for a v1. Revisit if benchmarks take >5 minutes.

### Streaming (SSE)

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| Native Web APIs | -- | SSE from Route Handlers | Next.js Route Handlers support ReadableStream + TransformStream natively. No library needed. Set headers: `Content-Type: text/event-stream`, `Cache-Control: no-cache, no-transform`, `Content-Encoding: none`. Use `TextEncoderStream` for formatting. | HIGH |

**No library needed.** SSE is simple enough that adding a library creates more complexity than it solves. The pattern is:

```typescript
// app/api/benchmark/[id]/stream/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 min default, up to 800 on Pro

export async function GET(req: Request) {
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();

  // Start benchmark orchestration in background
  orchestrateBenchmark(id, async (event) => {
    await writer.write(
      encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
    );
  }).finally(() => writer.close());

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Content-Encoding': 'none',
    },
  });
}
```

### Image Handling

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| Supabase Storage | -- | Store user-uploaded images | Signed upload URLs for direct client-to-storage upload (bypasses server body size limits). Signed download URLs for passing to vision APIs. Image transformations for thumbnails in reports. | HIGH |

**Image flow for vision API calls:**
1. Client uploads to Supabase Storage via signed upload URL
2. Server generates signed download URL (time-limited)
3. Pass signed URL to OpenRouter vision models (most accept image URLs)
4. For models requiring base64: fetch image server-side, convert to base64, send inline

**Do NOT base64-encode on upload.** Store the original file. Convert to base64 only when a specific model requires it, and do it server-side during benchmark execution.

### JSON Diff (Field-Level Error Analysis)

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| json-diff-ts | ^4.8.x | TypeScript-first JSON diffing | Computes field-level diffs between expected JSON and model output. TypeScript-native, zero dependencies, supports JSONPath. Returns structured changesets (add/remove/update per field) that map directly to the "field-level error diff" UI. | MEDIUM |

**Why json-diff-ts over jsondiffpatch:** jsondiffpatch (0.7.3) is more popular but hasn't been updated in 10 months. json-diff-ts is TypeScript-first with typed output. For this use case (comparing expected vs actual JSON extraction), you need structured field-level diffs, not patch operations. json-diff-ts returns `{ type: 'UPDATE', key: 'price', oldValue: '12.99', value: '12.00' }` which maps directly to the UI.

**Alternative if json-diff-ts falls short:** Write a custom recursive diff function (~50 lines). The expected vs actual comparison for structured data extraction is a constrained problem -- flat or shallow objects, known schema. A custom solution may be cleaner than any library.

### Styling and UI

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| Tailwind CSS | ^4.1.x | Utility-first CSS | Already in prototype. v4 has 5x faster builds, CSS-native config via `@theme`, no tailwind.config.js needed. Zero-config with `@tailwindcss/vite` (prototype) or `@tailwindcss/postcss` (Next.js). | HIGH |
| lucide-react | ^0.563.x | Icons | Already in prototype. Tree-shakeable, consistent style. 1500+ icons. | HIGH |

**CSS-based charts (no Recharts):** The prototype currently uses recharts (^3.7.0) but the decision is to use CSS-based charts. This means:
- Remove recharts from dependencies when migrating to Next.js
- Use CSS Grid + custom `<div>` bars/points with Tailwind
- Use CSS `conic-gradient` for pie charts if needed
- Inline SVG for scatter plots (accuracy vs cost) -- not a charting library, just `<svg>` with positioned `<circle>` elements

### Utilities

| Technology | Version | Purpose | Why Recommended | Confidence |
|------------|---------|---------|-----------------|------------|
| nanoid | ^5.1.x | Generate unique IDs | URL-friendly, 21-char IDs. 4x smaller than uuid. Use for benchmark run IDs, report share links. Crypto-secure random. | HIGH |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Turbopack | Dev server + builds | Default in Next.js 16. No config needed. 5-10x faster HMR than webpack. |
| ESLint 9 + typescript-eslint | Linting | Flat config format. Already in prototype. |
| Vercel CLI | Local dev + deploy | `vercel dev` for testing Fluid Compute behavior locally. |
| Supabase CLI | Local Postgres + migrations | `supabase init`, `supabase start` for local dev. `supabase db push` for migrations. |
| Stripe CLI | Webhook testing | `stripe listen --forward-to localhost:3000/api/webhooks/stripe` for local webhook forwarding. |

---

## Deployment Infrastructure

| Technology | Purpose | Why Recommended | Confidence |
|------------|---------|-----------------|------------|
| Vercel (Pro plan) | Hosting + Fluid Compute | Required for 800s max duration. Default 300s sufficient for most benchmarks. Fluid Compute handles concurrent SSE connections efficiently. Auto-scaling, zero-config. | HIGH |
| Supabase (Pro plan) | Database + Auth + Storage | Free tier (500MB DB, 1GB storage) works for launch. Pro ($25/mo) for 8GB DB, 100GB storage, daily backups. No connection pooler needed at launch -- use direct connection with Supabase's built-in pgBouncer. | MEDIUM |

### Vercel Fluid Compute Specifics

| Setting | Hobby | Pro | Enterprise |
|---------|-------|-----|-----------|
| Default duration | 300s (5 min) | 300s (5 min) | 300s (5 min) |
| Max duration | 300s (5 min) | 800s (13 min) | 800s (13 min) |
| Multi-region failover | Yes | Yes | Yes |
| Multi-region functions | No | Up to 3 | All |

**Critical config for SSE route handler:**
```typescript
export const runtime = 'nodejs'; // Required for streaming
export const dynamic = 'force-dynamic'; // Prevent caching
export const maxDuration = 300; // Increase to 800 on Pro if needed
```

---

## OpenRouter Rate Limit Strategy

OpenRouter's rate limiting is dynamic and tied to account balance:

| Account State | Rate Limit | Notes |
|---------------|-----------|-------|
| Free models | 20 RPM | Not relevant -- we use paid models |
| Paid, $1+ balance | ~1 RPS per $1 balance | Dynamic scaling |
| Paid, $50+ balance | Up to 50 RPS | Practical ceiling for most accounts |
| Paid, $500+ balance | Up to 500 RPS | Maximum documented |

**Strategy for 1,000+ calls:**
- Maintain $50+ OpenRouter balance for ~50 RPS capacity
- Use p-queue with concurrency 20-30 (conservative, well within limits)
- Each benchmark run costs ~$0.50-2.00 in API fees (20 models x variable pricing)
- At concurrency 25 and ~3s avg per call: ~1000 calls / 25 = 40 batches x 3s = 120s total
- Well within Vercel's 300s default duration

**Fallback:** If a model's provider throttles through OpenRouter, catch 429 errors and retry with exponential backoff. p-queue does not have built-in retry, so wrap each task:

```typescript
async function callWithRetry(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try { return await fn(); }
    catch (e) {
      if (attempt === maxRetries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000 * 2 ** attempt));
    }
  }
  throw new Error('unreachable');
}
```

---

## Installation

```bash
# Create Next.js 16 project
npx create-next-app@latest modelpick --typescript --tailwind --app --src-dir

# Core dependencies
npm install @supabase/supabase-js @supabase/ssr stripe ai @openrouter/ai-sdk-provider zod p-queue nanoid

# UI
npm install lucide-react

# JSON diff for field-level error analysis
npm install json-diff-ts

# Dev dependencies (most come with create-next-app)
npm install -D @types/node supabase stripe-event-types
```

**Note:** `tailwindcss` and `@tailwindcss/postcss` are included by `create-next-app@latest` when using `--tailwind`.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| AI SDK + OpenRouter provider | Direct OpenRouter REST API (fetch) | If you need fine-grained control over request/response format, or AI SDK abstractions add overhead. But AI SDK's `generateText` with structured output + Zod is too valuable to skip for this use case. |
| p-queue | Inngest / Trigger.dev | If benchmark execution exceeds Vercel's 800s max duration. Adds $25+/mo and deployment complexity. Not needed at v1 given the math above. |
| p-queue | p-limit | If you don't need progress events. p-limit is simpler but has no event emitters for tracking completion count. |
| Supabase Storage | Cloudflare R2 / AWS S3 | If you need edge-optimized global image delivery. Supabase Storage is simpler (same auth, same SDK) and sufficient for vision API input images. |
| @supabase/ssr | NextAuth / Clerk | If you need social login providers beyond what Supabase Auth offers (Google, GitHub, etc. are supported). Clerk is $25/mo for 10K MAU. Supabase Auth is free for 50K MAU. |
| json-diff-ts | Custom diff function | If the library's output format doesn't match your UI needs. A custom ~50 line recursive diff is easy for flat/shallow JSON schemas. |
| SSE (native) | Supabase Realtime Broadcast | If you need bi-directional communication or push to multiple clients. SSE is simpler, scales on Vercel, has built-in reconnect. Benchmark progress is unidirectional server-to-client. |
| CSS charts | Recharts / Chart.js | If you need complex interactive charts (zoom, pan, tooltips on hover). CSS charts are lighter, SSR-friendly, and sufficient for bar charts + scatter plots in a report. |
| Stripe Checkout (hosted) | Stripe Elements (embedded) | If you need the payment form embedded in your page. Hosted Checkout is simpler, PCI-compliant by default, supports Apple/Google Pay out of the box, and conversion rates are comparable. |
| nanoid | crypto.randomUUID() | If you want zero dependencies. crypto.randomUUID() gives UUID v4 (36 chars). nanoid gives 21-char URL-friendly IDs that are better for share URLs like `/report/V1StGXR8_Z5jdHi6B-myT`. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| @supabase/auth-helpers-nextjs | Deprecated. No new features or bug fixes. | @supabase/ssr (^0.8.x) |
| generateObject / streamObject (AI SDK) | Deprecated in AI SDK 6. Will be removed in a future major version. | generateText / streamText with `output` parameter |
| recharts | Decision to use CSS-based charts. Recharts adds ~200KB to client bundle. SSR issues with Next.js App Router. | CSS Grid bars, inline SVG scatter plots |
| WebSocket (ws / socket.io) | Over-engineered for unidirectional progress streaming. Requires persistent connection management. Does not work well on Vercel serverless. | Native SSE via ReadableStream in Route Handlers |
| Prisma | Adds ORM abstraction over Supabase's Postgres. Supabase JS client handles queries. Prisma's generated client bloats serverless bundle. | @supabase/supabase-js for queries, raw SQL via Supabase for complex queries |
| tRPC | Type-safe API layer is valuable for large apps, but ModelPick has ~5 API routes. Server Actions + Route Handlers are sufficient. tRPC adds boilerplate for minimal routes. | Next.js Server Actions + Route Handlers |
| Redis / Upstash | Not needed for v1. Benchmark state lives in Postgres during execution and SSE streams to one client. No pub/sub needed. | Postgres row updates + SSE |
| BullMQ / bee-queue | Server-based job queues require separate infrastructure (Redis). p-queue runs in-process within the Vercel function. | p-queue for in-process concurrency |

---

## Version Compatibility Matrix

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| next@16.1.x | react@19.2.x, react-dom@19.2.x | Bundled together. Don't install React separately. |
| ai@6.0.x | @openrouter/ai-sdk-provider@2.1.x | Provider implements AI SDK 6 provider interface. |
| ai@6.0.x | zod@4.x | AI SDK 6 uses zodSchema() internally. Zod 4 supported. |
| @supabase/ssr@0.8.x | @supabase/supabase-js@2.95.x | SSR package wraps supabase-js. Must use v2. |
| next@16.1.x | tailwindcss@4.1.x | Use @tailwindcss/postcss (not @tailwindcss/vite) with Next.js. |
| p-queue@9.1.x | Node.js 18+ | ESM-only. Works in Next.js App Router (ESM by default). |
| stripe@20.3.x | API version 2026-01-28.clover | SDK auto-uses this API version. |

---

## Stack Patterns by Variant

**If benchmark execution exceeds 800s on Pro plan:**
- Move orchestration to Inngest or Trigger.dev
- SSE endpoint polls Supabase Realtime or Postgres for progress
- Route Handler becomes a thin proxy, not the orchestrator
- Cost: +$25-50/mo for job queue service

**If OpenRouter rate limits become a bottleneck:**
- Split calls across multiple OpenRouter API keys (each key has independent limits)
- Or use direct provider APIs (OpenAI, Anthropic, Google) for high-volume models
- AI SDK supports multiple providers -- swap provider per model without code changes

**If you need the report to be shareable without auth:**
- Generate a nanoid-based share token
- Store report data as JSON in Supabase with public RLS policy on share token
- No auth required to view -- just `/report/[shareId]`

---

## Sources

- [Next.js 16 blog post](https://nextjs.org/blog/next-16) -- v16 features, React Compiler stable, Turbopack default
- [Next.js 16.1 blog post](https://nextjs.org/blog/next-16-1) -- cacheLife/cacheTag stable
- [Next.js upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16) -- verified version 16.1.6 current
- [Vercel Fluid Compute docs](https://vercel.com/docs/fluid-compute) -- verified duration limits: Hobby 300s, Pro/Enterprise 800s max
- [OpenRouter rate limits docs](https://openrouter.ai/docs/api/reference/limits) -- dynamic rate limiting, $1 = 1 RPS
- [OpenRouter API docs](https://openrouter.ai/docs/api/reference/overview) -- vision/multimodal support confirmed
- [Supabase JS releases](https://github.com/supabase/supabase-js/releases) -- verified v2.95.3
- [Supabase SSR package](https://supabase.com/docs/guides/auth/server-side/creating-a-client) -- createBrowserClient/createServerClient pattern
- [Supabase SSR migration guide](https://supabase.com/docs/guides/auth/server-side/migrating-to-ssr-from-auth-helpers) -- auth-helpers deprecated
- [stripe npm](https://www.npmjs.com/package/stripe) -- verified v20.3.1
- [Stripe Checkout quickstart](https://docs.stripe.com/checkout/quickstart?client=next) -- Next.js integration
- [AI SDK 6 introduction](https://ai-sdk.dev/docs/introduction) -- verified v6.0.78
- [AI SDK 6 migration guide](https://ai-sdk.dev/docs/migration-guides/migration-guide-6-0) -- generateObject deprecated, use generateText with output
- [AI SDK structured data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data) -- Output.object({ schema }) pattern
- [@openrouter/ai-sdk-provider npm](https://www.npmjs.com/package/@openrouter/ai-sdk-provider) -- verified v2.1.1
- [Zod npm](https://www.npmjs.com/package/zod) -- verified v4.3.6
- [p-queue npm](https://www.npmjs.com/package/p-queue) -- verified v9.1.0, ESM-only
- [p-queue GitHub](https://github.com/sindresorhus/p-queue) -- events API documented
- [Tailwind CSS v4 npm](https://www.npmjs.com/package/tailwindcss) -- verified v4.1.18
- [lucide-react npm](https://www.npmjs.com/package/lucide-react) -- verified v0.563.0
- [nanoid npm](https://www.npmjs.com/package/nanoid) -- verified v5.1.6
- [json-diff-ts npm](https://www.npmjs.com/package/json-diff-ts) -- v4.8.2
- [jsondiffpatch npm](https://www.npmjs.com/package/jsondiffpatch) -- v0.7.3 (considered, not recommended)
- [SSE in Next.js (Medium, Jan 2026)](https://medium.com/@oyetoketoby80/fixing-slow-sse-server-sent-events-streaming-in-next-js-and-vercel-99f42fbdb996) -- buffering fix with Content-Encoding: none
- [SSE implementation guide](https://medium.com/@ammarbinshakir557/implementing-server-sent-events-sse-in-node-js-with-next-js-a-complete-guide-1adcdcb814fd) -- ReadableStream pattern

---
*Stack research for: ModelPick -- Paid Vision Model Benchmarking SaaS*
*Researched: 2026-02-11*
