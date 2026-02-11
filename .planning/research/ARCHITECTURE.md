# Architecture Research

**Domain:** Paid vision model benchmarking SaaS (structured data extraction)
**Researched:** 2026-02-11
**Confidence:** MEDIUM-HIGH

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ Upload Form  │  │ SSE Listener │  │ Report View  │                  │
│  │ (images+JSON)│  │ (progress)   │  │ (dashboard)  │                  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                  │
├─────────┴──────────────────┴────────────────┴──────────────────────────┤
│                         NEXT.JS APP ROUTER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ /api/upload  │  │ /api/bench/  │  │ /api/stripe  │  │ /api/sse/  │ │
│  │ Route Handler│  │ [id]/start   │  │ /webhook     │  │ [id]       │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬─────┘ │
│         │                 │                  │                 │        │
├─────────┴─────────────────┴──────────────────┴─────────────────┴───────┤
│                     ORCHESTRATION LAYER                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │               Benchmark Orchestrator                             │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐       ┌──────────┐    │   │
│  │  │ Model    │ │ Model    │ │ Model    │  ...  │ Model    │    │   │
│  │  │ Worker 1 │ │ Worker 2 │ │ Worker 3 │       │ Worker 20│    │   │
│  │  │(semaphore│ │(semaphore│ │(semaphore│       │(semaphore│    │   │
│  │  │ =5)      │ │ =5)      │ │ =5)      │       │ =5)      │    │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘       └────┬─────┘    │   │
│  └───────┴────────────┴────────────┴──────────────────┴───────────┘   │
│                                │                                       │
├────────────────────────────────┴───────────────────────────────────────┤
│                     EXTERNAL SERVICES                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │  OpenRouter  │  │    Stripe    │  │   Resend     │                  │
│  │  (20 models) │  │  (payments)  │  │  (email)     │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                     DATA LAYER                                          │
│  ┌──────────────────────────────────┐  ┌──────────────────────────┐    │
│  │  Supabase Postgres               │  │  Supabase Storage        │    │
│  │  - reports, benchmark_runs,      │  │  - uploaded images       │    │
│  │    model_results, payments       │  │  - generated PDFs        │    │
│  │  - Realtime (progress channel)   │  │                          │    │
│  └──────────────────────────────────┘  └──────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Upload Form** | Collect 3 images + expected JSON per image, validate inputs | React client component, Supabase Storage signed URL upload |
| **Stripe Checkout** | Create checkout session, handle payment confirmation | Next.js Route Handler -> Stripe API, webhook for confirmation |
| **Benchmark Orchestrator** | Coordinate 20 model workers, manage overall progress, write results | Single Vercel Function (Fluid Compute, 800s max), `waitUntil` for cleanup |
| **Model Worker** | Run 50 API calls for one model with per-model semaphore + adaptive backoff | Async function with p-limit(5), exponential backoff on 429s |
| **SSE Endpoint** | Stream real-time progress to browser as models complete | Next.js Route Handler returning ReadableStream with `text/event-stream` |
| **Report Generator** | Compute statistics, rankings, error diffs from raw results | Server-side computation after all models complete |
| **Report Viewer** | Render interactive dashboard (bubble chart, table, diffs, cost calc) | React Server Components + client interactive components |
| **Webhook Handler** | Verify Stripe signatures, update payment status, trigger benchmark | Next.js Route Handler, raw body parsing for signature verification |
| **Email Service** | Send report completion emails with unique link | Resend API, triggered after report generation |

## Recommended Project Structure

```
src/
├── app/                           # Next.js App Router
│   ├── (marketing)/               # Landing page, pricing
│   │   ├── page.tsx               # Landing page
│   │   └── layout.tsx             # Marketing layout
│   ├── (app)/                     # Authenticated/report pages
│   │   ├── upload/                # Upload form page
│   │   │   └── page.tsx
│   │   ├── processing/[id]/       # Real-time processing view
│   │   │   └── page.tsx
│   │   ├── report/[id]/           # Public report view
│   │   │   └── page.tsx
│   │   └── dashboard/             # User's reports list
│   │       └── page.tsx
│   ├── api/
│   │   ├── upload/                # Image upload handler
│   │   │   └── route.ts
│   │   ├── checkout/              # Stripe checkout session creation
│   │   │   └── route.ts
│   │   ├── webhook/               # Stripe webhook receiver
│   │   │   └── route.ts
│   │   ├── benchmark/
│   │   │   └── [id]/
│   │   │       └── start/         # Benchmark kickoff endpoint
│   │   │           └── route.ts
│   │   └── sse/
│   │       └── [id]/              # SSE progress stream
│   │           └── route.ts
│   └── layout.tsx                 # Root layout
├── lib/
│   ├── benchmark/                 # Core benchmarking engine
│   │   ├── orchestrator.ts        # Coordinates all 20 model workers
│   │   ├── model-worker.ts        # Runs 50 calls for one model
│   │   ├── semaphore.ts           # Per-model concurrency limiter
│   │   ├── backoff.ts             # Adaptive exponential backoff
│   │   ├── json-diff.ts           # Field-level JSON comparison
│   │   └── statistics.ts          # Accuracy, P50, P95, IQR computation
│   ├── openrouter/                # OpenRouter API client
│   │   ├── client.ts              # API wrapper with retry logic
│   │   ├── models.ts              # Model registry (20 models + metadata)
│   │   └── pricing.ts             # Cost calculation from token counts
│   ├── stripe/                    # Stripe integration
│   │   ├── checkout.ts            # Session creation helper
│   │   └── webhook.ts             # Signature verification + handlers
│   ├── supabase/                  # Database layer
│   │   ├── client.ts              # Server + browser clients
│   │   ├── admin.ts               # Service role client for server ops
│   │   └── queries.ts             # Typed query functions
│   ├── email/                     # Transactional email
│   │   └── resend.ts              # Report completion email
│   └── report/                    # Report generation
│       ├── generator.ts           # Compile results into report data
│       └── pdf.ts                 # PDF export (deferred to post-MVP)
├── components/                    # React components
│   ├── upload/                    # Upload form components
│   ├── processing/                # Progress tracking UI
│   ├── report/                    # Report dashboard components
│   │   ├── bubble-chart.tsx       # CSS-based bubble chart
│   │   ├── ranked-table.tsx       # Model comparison table
│   │   ├── error-diffs.tsx        # Field-level diff viewer
│   │   └── cost-calculator.tsx    # Interactive cost comparison
│   └── ui/                        # Shared UI primitives
├── types/                         # TypeScript type definitions
│   ├── benchmark.ts               # Report, Run, ModelResult types
│   ├── database.ts                # Supabase generated types
│   └── openrouter.ts              # API response types
└── config/                        # Configuration
    ├── models.ts                  # 20-model lineup with metadata
    └── constants.ts               # Pricing, limits, defaults
```

### Structure Rationale

- **`lib/benchmark/`**: The core business logic is isolated from Next.js concerns. The orchestrator and model workers are pure async functions testable without a framework.
- **`lib/openrouter/`**: Single point of OpenRouter API interaction. Centralizes retry logic and cost tracking.
- **`app/api/`**: Thin route handlers that validate input and delegate to `lib/`. No business logic in routes.
- **Route groups `(marketing)` and `(app)`**: Separate layouts. Marketing pages are static/ISR. App pages require auth context.
- **`types/`**: Shared type definitions prevent drift between database schema, API responses, and frontend rendering.

## Architectural Patterns

### Pattern 1: Single Long-Running Function with SSE (Primary Architecture)

**What:** The benchmark runs inside a single Vercel Function (Fluid Compute) that orchestrates all 20 model workers, writes results to Supabase as they complete, and the client receives updates via a separate SSE connection that reads from Supabase Realtime.

**When to use:** This is the default architecture. Use for all reports.

**Trade-offs:**
- Pro: Simple. One function, no distributed coordination, no queues.
- Pro: 800s max duration on Vercel Pro is well within the 1-2 minute benchmark target.
- Pro: All 20 models run in parallel within a single Node.js event loop -- natural fit for I/O-bound work.
- Con: 1,024 file descriptor limit per function instance. With 100 concurrent HTTP connections (20 models x 5 concurrent), this consumes ~100 file descriptors plus runtime overhead. Manageable, but requires monitoring.
- Con: Single point of failure. If the function crashes at minute 6, partial results are lost unless persisted incrementally.

**Example:**
```typescript
// lib/benchmark/orchestrator.ts
import pLimit from 'p-limit';
import { createModelWorker } from './model-worker';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function runBenchmark(reportId: string, config: BenchmarkConfig) {
  const models = getActiveModels(); // 20 models

  // All models run in parallel -- each model manages its own concurrency
  const results = await Promise.allSettled(
    models.map(model =>
      createModelWorker(model, config, {
        onRunComplete: (run) => {
          // Persist each run immediately for crash recovery
          supabaseAdmin.from('benchmark_runs').insert(run);
        },
        onModelComplete: (result) => {
          // Write model summary + notify SSE listeners via Realtime
          supabaseAdmin.from('model_results').insert(result);
        },
      })
    )
  );

  // Compute final report statistics
  const report = computeReportStats(results);
  await supabaseAdmin.from('reports').update(report).eq('id', reportId);
}
```

### Pattern 2: Per-Model Semaphore with Adaptive Backoff

**What:** Each model gets its own concurrency limiter (semaphore) set to 5 concurrent requests. On 429 responses, backoff is applied per-model (not globally), so one rate-limited model does not slow down others.

**When to use:** Always. This is core to preventing OpenRouter rate limit collisions.

**Trade-offs:**
- Pro: Models are independently rate-limited. A 429 on GPT-5 does not block Claude Sonnet.
- Pro: Adaptive backoff per model adjusts to each provider's actual limits.
- Con: More complex than a global semaphore. Requires tracking backoff state per model.

**Example:**
```typescript
// lib/benchmark/model-worker.ts
import pLimit from 'p-limit';

interface BackoffState {
  delay: number;
  consecutive429s: number;
}

export async function createModelWorker(
  model: ModelConfig,
  config: BenchmarkConfig,
  callbacks: WorkerCallbacks
) {
  const limit = pLimit(5); // Max 5 concurrent per model
  const backoff: BackoffState = { delay: 0, consecutive429s: 0 };

  const runs = config.images.flatMap((image, imageIdx) =>
    Array.from({ length: config.runsPerImage }, (_, runIdx) => ({
      image, imageIdx, runIdx
    }))
  );

  const results = await Promise.allSettled(
    runs.map(run => limit(async () => {
      if (backoff.delay > 0) {
        await sleep(backoff.delay + jitter());
      }

      try {
        const result = await callOpenRouter(model, run.image, config.prompt);
        backoff.consecutive429s = 0;
        backoff.delay = Math.max(0, backoff.delay - 100);
        callbacks.onRunComplete(result);
        return result;
      } catch (err) {
        if (is429Error(err)) {
          backoff.consecutive429s++;
          backoff.delay = Math.min(
            30_000,
            1000 * Math.pow(2, backoff.consecutive429s) + jitter()
          );
          // Re-queue by throwing -- p-limit will retry via outer loop
          throw err;
        }
        throw err;
      }
    }))
  );

  const summary = computeModelSummary(model, results);
  callbacks.onModelComplete(summary);
  return summary;
}
```

### Pattern 3: Supabase Realtime as SSE Bridge

**What:** Instead of maintaining a direct SSE connection from the benchmark function to the client, the benchmark function writes progress to Supabase Postgres. The client subscribes to Supabase Realtime (postgres_changes) to receive updates. A separate lightweight SSE endpoint can also be used if Supabase Realtime proves unreliable for this use case.

**When to use:** This is the recommended approach for decoupling the benchmark execution from the progress delivery.

**Trade-offs:**
- Pro: Benchmark function and SSE delivery are completely decoupled. If the client disconnects and reconnects, it just re-subscribes and catches up.
- Pro: Supabase Realtime handles websocket management -- no need to manage connections in your function.
- Pro: Progress is always persisted. Crash recovery is built-in.
- Con: Added latency (~100-200ms) for each update through Supabase's realtime pipeline.
- Con: Supabase Realtime uses websockets under the hood, but the client SDK handles this transparently.

**Alternative (Direct SSE):** If you prefer lower latency for the processing view, use a direct SSE Route Handler that the benchmark function writes to via a shared in-memory state or Supabase subscription forwarding. However, this couples the SSE connection lifetime to the function instance and complicates reconnection.

**Recommendation:** Use Supabase Realtime for the client. It is simpler, more resilient, and the 100-200ms latency is imperceptible for a 1-2 minute benchmark.

## Data Flow

### Flow 1: Upload and Payment

```
User uploads 3 images + expected JSON
    |
    v
[Client] --POST multipart--> [/api/upload Route Handler]
    |                              |
    |                              v
    |                         Create signed upload URLs (Supabase Storage)
    |                              |
    |                              v
    |                         Client uploads directly to Supabase Storage
    |                              |
    v                              v
[Client]                     INSERT report row (status: 'pending_payment')
    |                         into Supabase Postgres
    |
    v
[Client] --POST--> [/api/checkout Route Handler]
    |                    |
    |                    v
    |              Create Stripe Checkout Session
    |              (metadata: { reportId })
    |                    |
    v                    v
[Redirect to Stripe Checkout] --> [User pays $14.99]
    |
    v
[Stripe sends webhook] --POST--> [/api/webhook Route Handler]
    |                                  |
    |                                  v
    |                            Verify Stripe signature
    |                            UPDATE report status = 'paid'
    |                            Trigger benchmark start (fetch /api/benchmark/[id]/start)
    |                                  |
    v                                  v
[Redirect to /processing/[id]]   [Benchmark begins]
```

### Flow 2: Benchmark Execution

```
[/api/benchmark/[id]/start Route Handler]
    |
    v
Verify report.status === 'paid' && report.status !== 'running'
UPDATE report status = 'running'
    |
    v
┌─────────────────────────────────────────────────┐
│         Benchmark Orchestrator                   │
│                                                  │
│  Promise.allSettled([                            │
│    modelWorker(model1, semaphore=5),             │
│    modelWorker(model2, semaphore=5),             │
│    ...                                           │
│    modelWorker(model20, semaphore=5),            │
│  ])                                              │
│                                                  │
│  Each model worker:                              │
│  - Runs 50 API calls (3 images x ~17 runs each) │
│  - Per-call: INSERT benchmark_run row            │
│  - On 429: adaptive backoff (per-model)          │
│  - On complete: INSERT model_result summary      │
│  - Each DB write triggers Supabase Realtime      │
│                                                  │
│  Total: ~1,000 API calls, ~100 concurrent max    │
│  Duration: ~60-120 seconds                       │
└─────────────────────────┬───────────────────────┘
                          |
                          v
                   All models complete
                          |
                          v
              Compute final report stats
              UPDATE report status = 'complete'
              Send completion email (Resend)
```

### Flow 3: Real-Time Progress (Client)

```
[Browser: /processing/[id] page]
    |
    v
Subscribe to Supabase Realtime channel
  channel = 'report-{id}'
  filter: postgres_changes on model_results table
  where report_id = {id}
    |
    v
┌────────────────────────────────────────────┐
│  On each model_result INSERT:              │
│                                            │
│  Update UI:                                │
│  - Model name + accuracy + cost            │
│  - Progress bar (X/20 models complete)     │
│  - Running best/worst model highlight      │
│  - Estimated time remaining                │
│                                            │
│  On report.status = 'complete':            │
│  - Redirect to /report/[id]               │
│  - OR render full report inline            │
└────────────────────────────────────────────┘
```

### Flow 4: Report Viewing

```
[GET /report/[id]]
    |
    v
[Next.js Server Component]
    |
    v
Fetch report + model_results + benchmark_runs from Supabase
    |
    v
Server-render report with:
  - Ranked table (RSC)
  - Bubble chart (Client Component)
  - Error diffs (Client Component, lazy loaded)
  - Cost calculator (Client Component)
    |
    v
[Cacheable via ISR -- revalidate on report update]
```

## Key Data Flow: SSE vs Supabase Realtime Decision

**Decision: Use Supabase Realtime, not a custom SSE endpoint.**

| Criterion | Custom SSE Route Handler | Supabase Realtime |
|-----------|--------------------------|-------------------|
| Implementation complexity | High (manage ReadableStream, reconnection, heartbeat) | Low (Supabase client SDK) |
| Crash recovery | Lost if function restarts | Data persisted in Postgres, client re-subscribes |
| Client reconnection | Must implement custom retry logic | Supabase SDK handles reconnection |
| Latency | ~0ms (direct stream) | ~100-200ms (through Postgres replication) |
| Connection to benchmark | Tightly coupled (same or shared function) | Fully decoupled (DB is the bridge) |
| Scalability | One SSE connection per function instance | Supabase handles fan-out |

Supabase Realtime wins on every dimension except raw latency, which is irrelevant for a 1-2 minute process where updates arrive every 3-6 seconds (one per model completion).

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-50 reports/day | Single Vercel Function per benchmark. No queue needed. Supabase Free/Pro tier handles it. |
| 50-200 reports/day | Monitor OpenRouter rate limits. May need to increase account balance for higher RPS ($1 = 1 RPS on OpenRouter). Add basic queue (Vercel Workflow or Inngest) if concurrent benchmarks collide. |
| 200+ reports/day | Move benchmark execution to Vercel Workflow for durability and step-level retries. Add report generation queue. Consider connection pooling for Supabase. |

### Scaling Priorities

1. **First bottleneck: OpenRouter rate limits.** At $1 = 1 RPS on OpenRouter, a $50 balance gives 50 RPS. A single report uses ~100 concurrent requests at peak, so you need at minimum a $100 balance. At 10+ concurrent reports, you need $1,000+ balance. **Mitigation:** Pre-fund OpenRouter account generously. Monitor balance-to-RPS ratio.

2. **Second bottleneck: Concurrent function instances.** If 10 users buy reports simultaneously, that is 10 Vercel Functions each running for 1-2 minutes with 100 concurrent outbound HTTP connections each. Vercel Pro supports 30,000 concurrent function executions, so this is not a real limit -- but file descriptors (1,024 per instance) mean each function instance can handle at most ~900 outbound connections after runtime overhead. At 100 connections per benchmark, this is fine.

3. **Third bottleneck: Supabase Realtime connections.** Each active processing view opens a Realtime connection. Supabase Free tier allows 200 concurrent connections; Pro tier allows 500. At 50+ simultaneous benchmark viewers, upgrade to Supabase Pro.

## Anti-Patterns

### Anti-Pattern 1: Global Concurrency Limiter

**What people do:** Use a single `pLimit(100)` across all 20 models.
**Why it is wrong:** One model hitting 429s fills up the global queue with retries, starving healthy models of slots. A burst of retries for GPT-5 prevents Claude Sonnet from executing.
**Do this instead:** Per-model semaphores (`pLimit(5)` per model). Each model independently manages its own concurrency and backoff.

### Anti-Pattern 2: Streaming Results Directly from Benchmark Function via SSE

**What people do:** Open a ReadableStream in the benchmark Route Handler and write progress events as the benchmark runs, returning the stream as the response.
**Why it is wrong:** If the client disconnects (tab close, network blip), the stream is severed. Reconnection requires re-establishing the SSE connection and determining what was missed. If the Vercel function recycles, the stream dies. The SSE connection's lifetime is coupled to the function's lifetime.
**Do this instead:** Write results to Supabase Postgres. Let clients subscribe via Supabase Realtime. The benchmark function and the progress delivery are fully decoupled.

### Anti-Pattern 3: Relying on Stripe Success Page for Fulfillment

**What people do:** Trigger the benchmark on the Stripe Checkout success redirect URL (e.g., `/processing/[id]?session_id=xxx`).
**Why it is wrong:** Users can close the tab before the redirect completes. The success page load is not guaranteed. Bots or crawlers can hit the success URL. Double-triggers if user refreshes.
**Do this instead:** Use Stripe webhooks (`checkout.session.completed`) as the single source of truth for payment confirmation. The webhook triggers the benchmark. The success redirect page simply subscribes to progress.

### Anti-Pattern 4: Storing Raw API Responses Only in Memory

**What people do:** Accumulate all 1,000 API responses in a single array in the function's memory, then batch-write to the database after all complete.
**Why it is wrong:** If the function crashes at run 950, all 950 results are lost. Memory usage grows linearly (~1-5KB per response x 1,000 = 1-5MB, manageable but unnecessary risk).
**Do this instead:** Write each benchmark_run row to Supabase immediately after each API call completes. This provides incremental persistence, crash recovery, and real-time progress updates through Supabase Realtime for free.

### Anti-Pattern 5: Using Vercel Workflow for MVP

**What people do:** Reach for Vercel Workflow or Inngest immediately because "long-running task" sounds scary.
**Why it is wrong:** The benchmark completes in 1-2 minutes. Vercel Fluid Compute supports up to 800 seconds (13 minutes) on Pro. A single function handles this trivially. Adding a durable workflow framework introduces step serialization overhead, additional billing (Workflow Steps + Storage), debugging complexity, and a learning curve -- all for a task that fits comfortably in a single function.
**Do this instead:** Start with a single Vercel Function. Only adopt Vercel Workflow if: (a) benchmarks regularly exceed 5+ minutes, (b) you need step-level retry granularity, or (c) you are running 200+ concurrent benchmarks and need queue management.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **OpenRouter** | REST API via `fetch()`. Per-model `pLimit(5)`. Adaptive backoff on 429. Cost tracking via response `usage` field. | Balance must be pre-funded. $1 = 1 RPS dynamic limit. Keep $200+ balance for production. |
| **Stripe** | Checkout Session creation via Stripe SDK. Webhook verification via `stripe.webhooks.constructEvent()`. | Must use raw request body for signature verification -- disable Next.js body parsing in webhook route. Set `runtime = 'nodejs'` explicitly. |
| **Supabase Auth** | `@supabase/ssr` for server-side auth. Cookie-based session. RLS policies on all tables. | Reports table uses RLS: owner can read/write, public can read via share link. No auth required for report viewing. |
| **Supabase Storage** | Signed upload URLs for client-side image upload. Server reads via service role. | Bucket policy: authenticated upload, public read for report images (or signed read URLs). 50MB max per file is plenty for images. |
| **Supabase Realtime** | Client subscribes to `postgres_changes` on `model_results` filtered by `report_id`. | Enable Realtime on `model_results` and `reports` tables in Supabase dashboard. |
| **Resend** | REST API for transactional email. Triggered after report completion. | Simple -- single email template with report link. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Upload Form -> Storage | Signed URL upload (client direct to Supabase) | Bypasses Vercel's 4.5MB body limit. Images go directly to Supabase Storage. |
| Webhook -> Benchmark Start | Internal `fetch()` to `/api/benchmark/[id]/start` | Webhook handler triggers benchmark by calling the start endpoint. Could also use Supabase `pg_notify` or direct function call. |
| Benchmark -> Database | Supabase service role client (server-side) | Each completed run = 1 INSERT. Each completed model = 1 INSERT. ~1,020 writes per benchmark. |
| Database -> Client | Supabase Realtime (postgres_changes) | Client subscribes. ~20 meaningful events per benchmark (one per model completion). |
| Report Page -> Database | Supabase server client (RSC) | Single query fetches full report data. Cacheable with ISR. |

## Database Schema (Conceptual)

```sql
-- Core tables for the benchmark system

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending_payment',
  -- 'pending_payment' | 'paid' | 'running' | 'complete' | 'failed'
  stripe_session_id TEXT,
  image_urls TEXT[] NOT NULL,          -- Supabase Storage URLs
  expected_json JSONB[] NOT NULL,      -- Expected output per image
  extraction_prompt TEXT NOT NULL,     -- Generated prompt for models
  model_count INT NOT NULL DEFAULT 20,
  runs_per_model INT NOT NULL DEFAULT 50,
  -- Report results (populated after completion)
  recommended_model TEXT,
  total_api_cost NUMERIC(10,4),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex')
);

CREATE TABLE model_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,              -- OpenRouter model identifier
  model_name TEXT NOT NULL,            -- Display name
  tier TEXT NOT NULL,                  -- 'budget' | 'mid' | 'premium' | 'specialist'
  accuracy NUMERIC(5,2) NOT NULL,     -- 0.00 to 100.00
  avg_cost NUMERIC(10,6) NOT NULL,    -- Average cost per run
  total_cost NUMERIC(10,4) NOT NULL,  -- Total cost for 50 runs
  median_response_time INT NOT NULL,  -- P50 in milliseconds
  p95_response_time INT NOT NULL,     -- P95 in milliseconds
  spread INT NOT NULL,                -- IQR (P75-P25) in milliseconds
  total_runs INT NOT NULL,
  successful_runs INT NOT NULL,
  failed_runs INT NOT NULL,           -- API errors (not accuracy failures)
  error_patterns JSONB,               -- Aggregated field-level error stats
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE benchmark_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  model_result_id UUID REFERENCES model_results(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  image_index INT NOT NULL,           -- 0, 1, or 2
  run_index INT NOT NULL,             -- 0-49
  passed BOOLEAN NOT NULL,            -- Exact match?
  response_json JSONB,                -- Actual model output
  response_time_ms INT NOT NULL,      -- Total response time
  input_tokens INT,
  output_tokens INT,
  cost NUMERIC(10,6),                 -- Actual cost from OpenRouter
  error_diff JSONB,                   -- Field-level diff (null if passed)
  api_error TEXT,                     -- Non-null if API call failed
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id),
  user_id UUID REFERENCES auth.users(id),
  stripe_session_id TEXT NOT NULL UNIQUE,
  stripe_payment_intent_id TEXT,
  amount_cents INT NOT NULL,          -- 1499
  status TEXT NOT NULL,               -- 'pending' | 'completed' | 'refunded'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for query performance
CREATE INDEX idx_model_results_report ON model_results(report_id);
CREATE INDEX idx_benchmark_runs_report ON benchmark_runs(report_id);
CREATE INDEX idx_benchmark_runs_model_result ON benchmark_runs(model_result_id);
CREATE INDEX idx_reports_user ON reports(user_id);
CREATE INDEX idx_reports_share_token ON reports(share_token);

-- Enable Realtime on progress tables
ALTER PUBLICATION supabase_realtime ADD TABLE model_results;
ALTER PUBLICATION supabase_realtime ADD TABLE reports;
```

## Build Order (Dependency Chain)

The following build order respects dependencies between components:

### Phase 1: Foundation (must come first)

1. **Supabase project setup** -- database schema, auth, storage buckets, RLS policies
2. **Next.js App Router skeleton** -- root layout, route groups, basic pages
3. **Supabase client configuration** -- server + browser clients, typed queries

*Rationale: Everything depends on the database schema and Next.js routing.*

### Phase 2: Upload + Payment Pipeline

4. **Image upload flow** -- Supabase Storage signed URLs, upload form component
5. **Stripe Checkout integration** -- session creation, success/cancel redirects
6. **Stripe webhook handler** -- signature verification, payment status update

*Rationale: Users cannot generate reports without uploading data and paying. This is the entry point.*

### Phase 3: Benchmark Engine (core product)

7. **OpenRouter client** -- API wrapper, model registry, cost tracking
8. **Model worker** -- per-model semaphore, adaptive backoff, result persistence
9. **Benchmark orchestrator** -- coordinates 20 workers, manages report lifecycle
10. **JSON diff engine** -- field-level comparison for error diffs

*Rationale: The benchmark engine is the product. Depends on Supabase (for persistence) and the payment flow (to trigger runs).*

### Phase 4: Real-Time + Report

11. **Supabase Realtime subscription** -- client-side progress tracking
12. **Processing page** -- real-time progress UI
13. **Report statistics computation** -- accuracy, P50, P95, IQR, rankings
14. **Report page** -- ranked table, bubble chart, error diffs, cost calculator
15. **Email notification** -- Resend integration for report completion

*Rationale: Progress tracking and report rendering depend on the benchmark engine producing data.*

### Phase 5: Polish + Launch

16. **Landing page** -- marketing, example report, pricing
17. **Report sharing** -- public URLs via share_token
18. **PDF export** -- report download (can defer to post-MVP)
19. **Error handling + edge cases** -- timeout recovery, partial reports, refund flow

*Rationale: Polish depends on all core features being functional.*

## Critical Architecture Decisions Summary

| Decision | Choice | Rationale | Confidence |
|----------|--------|-----------|------------|
| Benchmark execution | Single Vercel Function (Fluid Compute, 800s) | 1-2 min runtime fits easily. No need for distributed orchestration at MVP scale. | HIGH |
| Progress delivery | Supabase Realtime (not custom SSE) | Decoupled from benchmark function. Crash-resilient. Free with Supabase. | HIGH |
| Concurrency model | Per-model `pLimit(5)`, 20 models in parallel | Prevents cross-model rate limit collisions. ~100 max concurrent connections fits within file descriptor limits. | HIGH |
| Image upload | Supabase Storage with signed URLs | Bypasses Vercel 4.5MB body limit. Direct client-to-storage upload. | HIGH |
| Payment trigger | Stripe webhook (not success page redirect) | Guaranteed delivery. Idempotent. Not dependent on user's browser. | HIGH |
| Queue/workflow system | None at MVP. Single function is sufficient. | Vercel Workflow adds complexity for a 1-2 minute task. Adopt at 200+ reports/day. | MEDIUM |
| Result persistence | Write each run immediately (not batch) | Enables real-time progress, crash recovery, and incremental reporting. | HIGH |
| Report caching | ISR on report pages | Reports are immutable after completion. Cache indefinitely with on-demand revalidation. | HIGH |

## Sources

- [Vercel Fluid Compute documentation](https://vercel.com/docs/fluid-compute) -- HIGH confidence. Verified 800s max duration on Pro, Fluid Compute defaults, waitUntil behavior.
- [Vercel Functions Limits](https://vercel.com/docs/functions/limitations) -- HIGH confidence. Verified 1,024 file descriptor limit, 4.5MB body limit, 4GB max memory on Pro.
- [Vercel Limits overview](https://vercel.com/docs/limits) -- HIGH confidence. Verified 30,000 concurrent function executions on Pro.
- [Vercel Workflow documentation](https://vercel.com/docs/workflow) -- MEDIUM confidence. Public beta as of research date. Pricing structure verified.
- [OpenRouter Rate Limits](https://openrouter.ai/docs/api/reference/limits) -- MEDIUM confidence. Dynamic RPS based on balance ($1 = 1 RPS, max 500 RPS). Exact limits for paid users partially documented.
- [Supabase Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs) -- HIGH confidence. Official documentation.
- [Supabase Realtime Benchmarks](https://supabase.com/docs/guides/realtime/benchmarks) -- MEDIUM confidence. 10K+ concurrent connections tested. Postgres changes processed on single thread.
- [Next.js SSE discussion](https://github.com/vercel/next.js/discussions/48427) -- MEDIUM confidence. Community-verified patterns for ReadableStream SSE in Route Handlers.
- [Stripe Checkout Next.js integration](https://docs.stripe.com/checkout/quickstart?client=next) -- HIGH confidence. Official Stripe documentation.
- [p-limit npm package](https://www.npmjs.com/package/p-limit) -- HIGH confidence. Standard concurrency control library.
- [Fixing Slow SSE Streaming in Next.js and Vercel](https://medium.com/@oyetoketoby80/fixing-slow-sse-server-sent-events-streaming-in-next-js-and-vercel-99f42fbdb996) -- LOW confidence. Single source, but identifies real buffering issues with X-Accel-Buffering header.

---
*Architecture research for: ModelPick -- Paid vision model benchmarking SaaS*
*Researched: 2026-02-11*
