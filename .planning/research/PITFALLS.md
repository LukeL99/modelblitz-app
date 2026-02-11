# Pitfalls Research

**Domain:** Paid vision model benchmarking SaaS (one-shot report, 1,000+ API calls per report via OpenRouter)
**Researched:** 2026-02-11
**Confidence:** HIGH (most pitfalls verified via official docs + multiple sources)

---

## Critical Pitfalls

Mistakes that cause rewrites, lost revenue, or fundamental product failure.

### Pitfall 1: Binary Exact-Match Accuracy Produces Misleading Zero-Percent Scores

**What goes wrong:**
Binary exact-match JSON comparison (`===` on serialized strings) fails on outputs that are semantically correct but formatted differently. A model that extracts `{"total": 42.5}` when the expected output is `{"total": "42.50"}` scores 0% accuracy -- even though the extraction is correct. Every single run for that model fails, making an excellent model look broken. When users see most models at 0-10% accuracy, the report feels worthless.

**Why it happens:**
LLMs produce JSON with unpredictable formatting variations even when the content is correct:
- **Number formatting:** `42.50` vs `42.5` vs `"42.50"` (string vs number, trailing zeros lost in JSON number type)
- **Key ordering:** `{"a":1,"b":2}` vs `{"b":2,"a":1}` (JSON spec does not mandate key order)
- **Whitespace:** Pretty-printed vs minified, trailing spaces, BOM characters
- **Null vs missing:** `{"tax": null}` vs `{}` (key absent vs explicitly null)
- **String normalization:** `"123 Main St."` vs `"123 Main St"` vs `"123 main st."`
- **Array ordering:** `["item1", "item2"]` vs `["item2", "item1"]` when order is semantically irrelevant
- **Boolean/string coercion:** `true` vs `"true"`, `"yes"` vs `true`
- **Date formats:** `"2026-02-11"` vs `"02/11/2026"` vs `"Feb 11, 2026"`

This is the single biggest risk to ModelPick's value proposition. If the comparison is too strict, reports show artificially low accuracy. If too loose, they lose the "exact match" differentiator.

**How to avoid:**
Implement a **canonicalization pipeline** before comparison, not a raw string comparison:

1. Parse both expected and actual JSON (catch parse failures as true errors)
2. Sort all object keys recursively (eliminates key ordering)
3. Normalize numbers: parse all numeric strings and numbers to a canonical form (e.g., `parseFloat` then `toString`, or fixed decimal places matching the expected output's format)
4. Normalize whitespace: trim all string values, collapse internal whitespace
5. Handle null/missing: treat `null` values and absent keys as equivalent (configurable)
6. Re-serialize with `JSON.stringify` using sorted keys and consistent formatting
7. Compare the canonical forms

Expose this as the **default** mode, and offer "strict raw match" as an opt-in toggle (inverse of the PRD's current framing). Users who genuinely need byte-identical output can enable it.

Additionally, always show the **field-level diff** regardless of pass/fail. Even when a run "fails," the user sees exactly which fields differ and by how much. This transforms a "0% accuracy" report from useless to highly informative.

**Warning signs:**
- During development testing, most models score below 30% accuracy on simple extractions
- Users ask "why does everything show 0%?" in support
- The relaxed-match toggle is used by 90%+ of users (means strict is the wrong default)

**Phase to address:**
Phase 1 (Core Engine). This must be solved before any user sees a report. Build canonicalization from day one; do not ship raw string comparison as the primary mode.

---

### Pitfall 2: OpenRouter Rate Limits Cause Cascading Failures Across 20 Models

**What goes wrong:**
Sending 100 concurrent requests (20 models x 5 concurrent per model) through a single OpenRouter API key triggers rate limits. OpenRouter's rate limiting is balance-based ($1 = 1 RPS baseline) and also subject to upstream provider limits (Anthropic, OpenAI, Google each have their own). A 429 on one provider-backed model can cascade: retries consume RPS budget, starving other models of capacity. The benchmark stalls, hits the Vercel 800s timeout, and the user gets nothing after paying $14.99.

**Why it happens:**
OpenRouter is an aggregator -- it routes to upstream providers who each enforce independent rate limits. When you hit Anthropic's rate limit for Claude models, OpenRouter returns 429 with the upstream's `Retry-After` header. But your per-model semaphore doesn't know about cross-model provider overlap (Claude Sonnet and Claude Haiku share Anthropic's rate limit pool). Meanwhile, retries consume your global OpenRouter RPS allocation.

Key facts from official docs:
- Free models: 20 requests/minute hard cap
- Paid accounts: $1 balance = 1 RPS, max 500 RPS
- DDoS protection (Cloudflare) blocks dramatically excessive usage
- Upstream 429s are passed through with provider's Retry-After headers
- Rate limits are per-API-key, not per-model

**How to avoid:**

1. **Provider-aware concurrency groups:** Instead of 20 independent model workers, group models by upstream provider. All Anthropic models share one concurrency pool (e.g., semaphore(3)), all OpenAI models share another. This prevents same-provider rate limit collision.

2. **Global RPS budget:** Implement a token bucket rate limiter at the OpenRouter API key level. With a $50 balance, you have ~50 RPS. Allocate budget across provider groups. A simple `p-limit` or token-bucket at the HTTP client level prevents exceeding the global cap.

3. **Exponential backoff with jitter per provider group:** On 429, back off the entire provider group, not just the individual model. Use the `Retry-After` header when present.

4. **Circuit breaker per model:** After 3 consecutive 429s for a single model, skip remaining runs and mark it as "rate limited -- incomplete data" in the report. Do not let one broken model block the entire benchmark.

5. **Pre-flight balance check:** Before starting the benchmark, verify the OpenRouter balance is sufficient for ~1,200 calls (1,000 planned + 200 retry buffer). Return early with an error if balance is too low.

**Warning signs:**
- Benchmark runs take >3 minutes (expected: 1-2 min)
- Certain models always have incomplete data
- 429 errors cluster in bursts affecting multiple models simultaneously
- OpenRouter balance depletes faster than expected (retries double-billing)

**Phase to address:**
Phase 1 (Core Engine). The concurrency and rate limiting architecture must be designed before the first real benchmark runs. This is not something to retrofit.

---

### Pitfall 3: Payment Succeeds But Benchmark Fails -- No Recovery Path

**What goes wrong:**
User pays $14.99 via Stripe Checkout. The `checkout.session.completed` webhook fires and triggers the benchmark. The benchmark crashes midway (OpenRouter outage, Vercel timeout, unhandled model error). The user has been charged but has no report. Without a recovery mechanism, this is either a refund (lost revenue + support cost) or a furious customer.

**Why it happens:**
Stripe Checkout is a redirect flow -- the user leaves your site, pays on Stripe's hosted page, then returns. The payment and the benchmark execution are two separate systems with no transactional coupling. The webhook handler is the bridge, but webhook handlers on Vercel are serverless functions with their own timeout constraints.

Common failure modes:
- Webhook handler starts benchmark synchronously and times out
- Benchmark completes 18/20 models, one model throws unhandled error, entire run lost
- Vercel function cold start delays webhook processing, Stripe retries, benchmark starts twice
- User closes browser during processing, SSE connection drops, but benchmark should still complete

**How to avoid:**

1. **Decouple payment from execution:** The webhook handler should do exactly three things: (a) verify Stripe signature, (b) create a benchmark record in the database with status `pending`, (c) return 200 immediately. Do NOT start the benchmark in the webhook handler.

2. **Separate benchmark trigger:** Use a separate mechanism to start the benchmark -- either a polling worker, a queue (Vercel cron + database check), or trigger it from the client-side return URL after confirming the `pending` record exists.

3. **Idempotent benchmark execution:** The benchmark runner must check: "Has this benchmark already started/completed?" before beginning. Stripe retries webhooks for up to 3 days, so the same event will arrive multiple times.

4. **Partial result persistence:** Save results per-model as they complete, not as one atomic write at the end. If the benchmark crashes after 15/20 models, the user still has 15 models of data. Allow re-running only the failed models.

5. **Manual retry mechanism:** Provide an admin endpoint (or user-facing "retry" button) that re-triggers a failed benchmark without requiring re-payment. Tie it to the Stripe payment intent ID for audit.

6. **Webhook idempotency guard:** Store `event.id` from Stripe webhooks in the database. On duplicate delivery, skip processing and return 200.

**Warning signs:**
- Any benchmark failure after payment with no database record of the attempt
- Stripe webhook retry logs showing repeated delivery attempts
- Customer support tickets saying "I paid but got nothing"
- Database shows `pending` benchmarks that never moved to `running` or `completed`

**Phase to address:**
Phase 2 (Payment + Execution Pipeline). The payment-to-benchmark flow is the most critical business logic in the entire product. Build it with failure recovery from day one. Do not prototype with a synchronous pay-then-run flow.

---

### Pitfall 4: SSE Streaming Breaks Silently on Vercel Due to Buffering

**What goes wrong:**
The SSE stream that shows real-time benchmark progress to users delivers all results at once after the benchmark completes, instead of incrementally as each model finishes. The user stares at a blank progress screen for 1-2 minutes, then everything appears simultaneously. This destroys the real-time UX that justifies the "processing" page.

**Why it happens:**
Next.js App Router route handlers buffer the Response body. If the async work (benchmark execution) runs inside the route handler before the Response is returned, Next.js waits for the handler function to complete before sending anything to the client. This is a well-documented Next.js behavior, not a bug.

Additionally:
- Next.js response compression can buffer SSE chunks
- Cloudflare (Vercel's CDN) may buffer responses unless `X-Accel-Buffering: no` is set
- `NextResponse` may introduce additional buffering vs raw `Response`
- Caching headers can cause SSE responses to be cached

**How to avoid:**

1. **Return Response immediately with ReadableStream:** The handler must construct a `ReadableStream`, wrap it in a standard `Response` (not `NextResponse`), and return it immediately. The actual benchmark work happens inside the stream's `start()` callback, which writes to the controller asynchronously.

```typescript
export const dynamic = 'force-dynamic';
export const maxDuration = 800;

export async function GET(request: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      // Do async work here, write chunks incrementally
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(result)}\n\n`));
      // When done:
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
```

2. **Set `dynamic = 'force-dynamic'`** to prevent Vercel from caching the SSE response.

3. **Set `maxDuration = 800`** on the route to allow the full Vercel Pro timeout.

4. **Use `X-Accel-Buffering: no`** header to prevent reverse proxy buffering.

5. **Send periodic heartbeat events** (every 15-30s) to keep the connection alive and detect client disconnection.

**Warning signs:**
- During development, SSE works fine locally but chunks arrive all-at-once on Vercel
- Users report the progress page "jumps" from 0% to 100%
- Vercel function logs show the full 800s duration even for fast benchmarks

**Phase to address:**
Phase 1 (Core Engine). The streaming infrastructure must be validated on Vercel early. Build a minimal SSE endpoint that sends one event per second and verify it streams incrementally when deployed. Do not wait until the full benchmark is built to test streaming.

---

### Pitfall 5: API Cost Budget Overrun Destroys Unit Economics

**What goes wrong:**
The ~$7 API cost budget per report is based on estimated per-model pricing. But actual costs vary because: (a) models return variable-length output tokens, (b) image token costs vary by image resolution and model, (c) OpenRouter pricing changes without notice, and (d) retries after failures consume additional budget. A single report that costs $12 instead of $7 wipes out the margin and then some.

**Why it happens:**
The PRD estimates costs assuming fixed per-run prices, but LLM API pricing is per-token, and token counts are unpredictable:
- A receipt image might cost 500 input tokens on GPT-4o but 2,000 on Gemini (different image tokenization)
- A model that hallucinates verbose JSON output costs more in output tokens
- Premium models (Claude Opus at ~$0.075/run) are the margin risk -- if Opus produces 3x expected output tokens, 50 runs cost $11+ from that model alone
- Failed requests that return partial responses may still be billed
- Retries after 429s or timeouts are double-billed

**How to avoid:**

1. **Real-time cost tracking during execution:** After each API call, calculate actual cost from OpenRouter's response headers (which include token counts and cost). Maintain a running total. If the total approaches a hard ceiling (e.g., $8.50), start cutting: reduce remaining runs for expensive models, skip the most expensive model entirely.

2. **Budget allocation by tier:** Pre-allocate budget: $0.50 for budget models (6 models, ~$0.08 each), $2.00 for mid-tier (7 models), $4.00 for premium (5 models), $0.50 reserve for retries. If a tier exceeds its allocation, reduce runs for remaining models in that tier.

3. **Max output tokens cap:** Set `max_tokens` in the API request to a reasonable ceiling (e.g., 2x the expected JSON output size in tokens). This prevents verbose hallucinations from inflating costs. For structured extraction, the output should be roughly the same size as the expected JSON.

4. **Fetch current pricing at benchmark start:** Query OpenRouter's pricing API for each model before the run begins. Calculate estimated total cost. If it exceeds the budget ceiling, warn the user or adjust the plan (fewer runs, fewer premium models).

5. **Store actual cost per report:** Track every report's actual API cost in the database. Set up alerts when average cost per report exceeds $6 or any single report exceeds $9. This is your margin canary.

**Warning signs:**
- Average report cost creeping above $7 over time
- Specific models consistently cost 2-3x their estimated price
- OpenRouter balance depleting faster than revenue from reports
- Individual reports costing >$10

**Phase to address:**
Phase 1 (Core Engine) for the budget tracking and max_tokens cap. Phase 2 (Testing Plan Wizard) for dynamic budget allocation based on user priorities. The cost tracking must be built into the execution engine from day one -- you cannot retrofit it.

---

## Moderate Pitfalls

### Pitfall 6: Vercel 800s Timeout Is Tighter Than It Appears

**What goes wrong:**
The benchmark is designed for 1-2 minute execution, and Vercel Pro allows 800 seconds. Seems like plenty of headroom. But the 800s counts wall-clock time from function invocation start, including cold starts, SSE connection setup, database writes, and all waiting time. With rate limit backoffs, a benchmark that should take 90 seconds can easily stretch to 5-6 minutes. Add a few retries and you are at risk.

**Why it happens:**
From Vercel docs: the duration "refers to the actual time elapsed during the entire invocation, regardless of whether that time was actively used for processing or spent waiting for a streamed response." With Fluid Compute, network I/O is optimized but still counts against the clock. Cold starts on first invocation add 1-5 seconds. Exponential backoff after 429s adds waiting time.

**How to avoid:**
- Set `maxDuration = 800` explicitly on the benchmark route handler
- Implement a hard timeout at 700 seconds (100s safety margin) that gracefully closes the SSE stream and saves partial results
- Use concurrent execution aggressively (parallel model groups) to minimize wall-clock time
- Monitor actual execution times in production; alert if P95 exceeds 400 seconds
- Consider Vercel Pro plan mandatory for this product -- Hobby plan's 300s default is not enough

**Warning signs:**
- Any benchmark run exceeding 5 minutes in testing
- Rate limit backoffs adding >60 seconds total
- Vercel function timeout errors in logs

**Phase to address:**
Phase 1 (Core Engine). Set the maxDuration and internal timeout from the start.

---

### Pitfall 7: Structured Output Support Varies Wildly Across Vision Models

**What goes wrong:**
You send `response_format: { type: "json_schema" }` to enforce structured JSON output, but not all 20 vision models support it. Some silently ignore it and return markdown-wrapped JSON (`\`\`\`json\n{...}\n\`\`\``). Others return valid JSON but with extra commentary. A few return completely unstructured text. Your parser breaks, the run fails, and the model's accuracy is artificially 0%.

**Why it happens:**
From OpenRouter docs: structured output support varies by model. When a model does not support it, "the request will fail with an error indicating lack of support." But some providers silently ignore the parameter instead of erroring. Budget and specialist models (Moondream, Phi-4, LLaVA) are less likely to support structured output modes.

**How to avoid:**

1. **Test each model for structured output support** during development and maintain a lookup table of which models support `json_schema`, which support `json_object`, and which need prompt-based extraction only.

2. **Layered extraction strategy:**
   - Tier 1: Use `response_format: { type: "json_schema" }` for models that support it
   - Tier 2: Use `response_format: { type: "json_object" }` for models that support JSON mode but not schema
   - Tier 3: For unsupported models, use prompt engineering ("Return ONLY valid JSON, no markdown, no commentary") and post-process the response to extract JSON

3. **Robust JSON extraction from responses:** Always attempt to extract JSON from the response regardless of mode. Strip markdown code fences, find the first `{` to last `}`, try `JSON.parse`. This handles models that wrap JSON in text.

4. **Record extraction method per model** in the report metadata so users understand why certain models may have lower accuracy (prompt-based extraction is inherently less reliable).

**Warning signs:**
- Certain models always fail with parse errors
- Models return valid JSON wrapped in markdown that your parser rejects
- Adding a new model to the lineup immediately breaks with errors

**Phase to address:**
Phase 1 (Core Engine). The extraction and parsing layer must handle all three tiers before launch. Build the JSON extraction utility first and test it against real responses from every model in the lineup.

---

### Pitfall 8: Image Handling Complexity Is Underestimated

**What goes wrong:**
Users upload images in various formats, sizes, and qualities. A 20MB RAW photo of a receipt, a PDF scan, a screenshot with transparency, a HEIC from an iPhone. The system must convert these to a format every vision model accepts, keep them small enough for API payloads, and send the same normalized image to all 20 models for fair comparison. Any variation in the image sent to different models invalidates the benchmark.

**Why it happens:**
OpenRouter accepts `image/png`, `image/jpeg`, `image/webp`, and `image/gif` -- but not HEIC, PDF, TIFF, or RAW formats. Some models have per-request payload size limits (e.g., 4.5MB for some providers). Base64 encoding increases file size by ~33%. Users uploading 3 images at 10MB each = 30MB of base64 data per API request, repeated 1,000 times.

Additionally, different models tokenize images differently. Higher resolution = more tokens = higher cost. But downscaling too aggressively reduces extraction accuracy.

**How to avoid:**

1. **Server-side image normalization pipeline:**
   - Accept any common format (JPEG, PNG, WebP, HEIC, PDF first page)
   - Convert to JPEG at 85% quality (best size/quality tradeoff for document images)
   - Resize to max 2048px on longest edge (sufficient for document text, reduces token costs)
   - Store the normalized image in Supabase Storage (or equivalent)
   - Use a publicly accessible URL for API calls (avoids base64 payload bloat)

2. **Use URL-based image input, not base64:** OpenRouter docs recommend URLs for efficiency. Upload normalized images to Supabase Storage with a short-lived public URL. This reduces each API request payload from megabytes to kilobytes.

3. **Client-side validation before upload:**
   - Max file size: 10MB per image
   - Max dimensions: 4096x4096
   - Accepted formats: JPEG, PNG, WebP, PDF (first page), HEIC
   - Show preview thumbnails so users confirm the correct images

4. **Send identical image data to all models:** Generate one normalized image URL per sample image. Every model receives the exact same URL. This ensures the benchmark is fair.

**Warning signs:**
- API calls failing with payload size errors
- Different models producing wildly different results on the same image (could be image format issue)
- Users uploading unsupported formats with no error message
- Supabase storage costs unexpectedly high

**Phase to address:**
Phase 1 (Upload + Storage). Image handling is a prerequisite for the benchmark engine. Build and test the normalization pipeline before connecting to OpenRouter.

---

### Pitfall 9: OpenRouter Model Availability Changes Without Notice

**What goes wrong:**
The product promises benchmarking across 20 specific vision models. But model availability on OpenRouter is dynamic -- models get added, removed, renamed, or temporarily unavailable. A user pays $14.99 and the report runs against 17/20 models because 3 are down. Or worse, a model ID changes (`anthropic/claude-3.5-sonnet` becomes `anthropic/claude-4-sonnet`) and API calls silently fail.

**Why it happens:**
OpenRouter is a routing layer over upstream providers. Provider outages, model deprecations, and pricing changes happen independently. OpenRouter's status page may show a model as available while the upstream provider is rate-limiting or returning errors.

**How to avoid:**

1. **Pre-flight model availability check:** Before starting a benchmark, make a lightweight test call to each model (e.g., "Respond with OK"). Skip models that fail. Show the user which models will be tested (e.g., "18/20 models available").

2. **Maintain a model registry in your database:** Store model IDs, display names, tier, expected cost, and `last_verified` timestamp. Run a daily cron job that tests each model's availability.

3. **Graceful degradation in reports:** If a model fails, show it as "Unavailable" in the report rather than omitting it. The user knows what they did and didn't get tested.

4. **Model fallback configuration is NOT appropriate here:** OpenRouter's fallback routing (which substitutes a different model on failure) would invalidate benchmark results. Explicitly disable fallback routing by setting `route: "fallback"` to `false` or not using the fallback models parameter. You need to know exactly which model produced each result.

5. **Version-pin model IDs:** Use specific model version IDs (e.g., `anthropic/claude-sonnet-4.5`) rather than aliases that might point to different versions over time.

**Warning signs:**
- Benchmark results include models the user didn't expect (fallback routing active)
- Model IDs in the database don't match current OpenRouter model IDs
- Specific models consistently fail with 404 or "model not found" errors

**Phase to address:**
Phase 1 (Core Engine) for the model registry and availability checking. Ongoing maintenance task for model lineup updates.

---

### Pitfall 10: SSE Client Disconnection Leaves Orphaned Benchmark Runs

**What goes wrong:**
The user closes their browser tab or loses network connectivity while the benchmark is running. The SSE connection drops. The server-side benchmark continues running (consuming API budget), but results have nowhere to stream. If the benchmark is only persisted via SSE events (not to database), all results are lost. The user returns to find nothing.

**Why it happens:**
On Vercel, the `ReadableStream.cancel()` method is reportedly not called reliably when deployed (works in development but not production). The function continues running until it completes or times out. There is no reliable server-side signal that the client disconnected.

**How to avoid:**

1. **Always persist results to database, independent of SSE:** The SSE stream is a read-through cache of the database. Every model result is written to the database as it completes. The SSE stream reads from the same source. If the client disconnects, results are still persisted.

2. **Client reconnection with EventSource:** Use the browser's native `EventSource` API, which automatically reconnects on connection loss. Include a `Last-Event-ID` header so the server can resume from where the client left off. Assign sequential IDs to each SSE event.

3. **Polling fallback:** If SSE reconnection fails 3 times, fall back to polling the report status endpoint every 5 seconds. The database has the results; the delivery mechanism is secondary.

4. **Do not rely on `ReadableStream.cancel()`** for cleanup on Vercel. Use `waitUntil` or the database status to determine when a benchmark is truly complete.

**Warning signs:**
- Users report seeing blank reports after closing and reopening the page
- Orphaned benchmark processes running to completion with no consumer
- Database has `running` benchmarks that never transition to `completed` but results exist per-model

**Phase to address:**
Phase 2 (Real-time Delivery). Build the database persistence first, then add SSE as an optimization layer on top.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Raw string JSON comparison | Simple to implement | Every model looks broken; users lose trust in results | Never -- canonicalization is required from day one |
| Synchronous benchmark in webhook handler | Fewer moving parts | Webhook timeouts, duplicate runs from retries, no error recovery | Never -- always decouple payment from execution |
| Base64 images in API payload | No storage dependency | 33% payload bloat x 1,000 calls = massive bandwidth cost, slower requests | Only during local development/testing |
| Single global concurrency pool | Simple rate limiting | Cross-provider rate limit collisions, one slow model blocks others | Never for production -- use provider-aware groups |
| Hardcoded model list | Fast iteration | Model deprecations break production, no way to add/remove models without deploy | Only in Phase 1 prototype; move to database registry before launch |
| No cost tracking per report | Faster development | Cannot detect margin erosion until monthly OpenRouter bill arrives | Only for first 10 test reports; add tracking before accepting real payments |
| In-memory benchmark state (no DB) | No database setup needed | Results lost on any failure, no retry capability, no historical data | Only for local development demos |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| OpenRouter | Using model fallback routing (substitutes a different model on failure) | Disable fallback routing for benchmarks; you must know exactly which model produced each result |
| OpenRouter | Assuming all models support `response_format: json_schema` | Maintain a per-model capability lookup; fall back to prompt-based JSON extraction for unsupported models |
| OpenRouter | Not setting `max_tokens` on requests | Always set `max_tokens` to ~2x expected JSON output size; prevents verbose hallucinations from inflating costs |
| Stripe | Processing benchmark synchronously in webhook handler | Return 200 immediately; create a `pending` database record; trigger benchmark separately |
| Stripe | Not handling duplicate webhook deliveries | Store Stripe `event.id` and skip processing on duplicates; webhooks retry for up to 3 days |
| Stripe | Relying on client-side redirect to confirm payment | Always use webhook as source of truth; client redirect is unreliable (user may close browser) |
| Vercel SSE | Using `NextResponse` instead of standard `Response` | Use native `Response` with `ReadableStream`; `NextResponse` may introduce buffering |
| Vercel SSE | Not setting `X-Accel-Buffering: no` header | Required to prevent reverse proxy buffering; without it, chunks arrive all at once |
| Vercel SSE | Not setting `dynamic = 'force-dynamic'` on route | SSE responses get cached; each request serves stale data from a previous stream |
| Supabase Storage | Storing images as base64 in database instead of Storage | Use Supabase Storage for binary files; store only the URL/path in the database |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Sequential model execution (one model at a time) | Benchmarks take 20+ minutes instead of 1-2 min | Use provider-grouped concurrency with per-model semaphores from day one | Immediately -- even one report is unacceptably slow |
| No connection pooling to OpenRouter | High latency per request, TCP handshake overhead x1,000 | Use a persistent HTTP agent with keep-alive; reuse connections within the benchmark | At >50 concurrent requests |
| Loading full report data on page load (all 1,000 run results) | Slow page load, high memory usage on client | Paginate raw run data; load summary stats eagerly, detailed runs lazily | At >5 models or >20 runs per model displayed |
| Re-running entire benchmark on retry | Doubles API cost, doubles time | Persist per-model results; retry only failed models | First time a benchmark partially fails |
| Single-region Vercel deployment | High latency for non-US users during SSE streaming | Deploy to 2-3 regions (US, EU, Asia) once user base is global | When >20% of users are outside primary region |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing OpenRouter API key in client-side code | Key theft; attacker runs unlimited API calls on your account | All OpenRouter calls must happen server-side; never expose the key in browser code or SSE payloads |
| No input validation on user-provided "expected JSON" | JSON injection, resource exhaustion (massive JSON payloads parsed 1,000 times) | Validate JSON size (<100KB), depth (<10 levels), and structure before accepting; reject invalid JSON before payment |
| Shareable report URLs with sequential IDs | Enumeration attack; scrape all reports by incrementing ID | Use UUIDv4 or nanoid for report IDs; never use auto-incrementing integers |
| Storing user-uploaded images without scanning | Malicious files uploaded as "receipt images" | Validate MIME type server-side (not just extension); consider virus scanning; restrict to image formats only |
| No rate limiting on benchmark trigger endpoint | Attacker triggers thousands of benchmarks, draining OpenRouter balance | Tie benchmark execution to a valid, unused Stripe payment intent; rate limit by IP and user |
| OpenRouter balance exposed in error messages | Reveals business financial data to users | Sanitize all OpenRouter error responses before forwarding to client |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing 0% accuracy without explanation | User thinks the product is broken | Always show field-level diffs alongside accuracy; explain "exact match means every character must match" |
| No progress indication during 1-2 min benchmark | User thinks the page is frozen; refreshes or leaves | Stream per-model progress with ETA; show which model is currently running and how many are complete |
| Requiring JSON knowledge from non-technical users | Barrier to entry; user doesn't know how to format expected output | Provide JSON templates for common document types (receipts, invoices); offer a visual JSON builder |
| Report shows only ranked table with no guidance | User doesn't know what to do with the information | Lead with a clear recommendation: "Use [model] -- it's 94% accurate at $0.003/run" with action steps |
| All 20 models shown equally when most are irrelevant | Information overload; user can't find what matters | Default view shows top 5 recommendations; "Show all models" expands to the full table |
| No explanation of statistical confidence | User doesn't trust "94% accuracy from 50 runs" | Show confidence intervals (e.g., "94% +/-4% at 95% CI"); explain "50 runs provides X% confidence" |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **JSON comparison:** Parsing both sides, sorting keys, normalizing numbers -- not just `JSON.stringify() === JSON.stringify()`
- [ ] **Payment flow:** Webhook handler is idempotent, handles retries, stores event IDs -- not just "payment triggers benchmark"
- [ ] **SSE streaming:** Returns Response immediately with ReadableStream, has heartbeat, handles reconnection -- not just "works in localhost"
- [ ] **Error handling per model:** Circuit breaker, timeout, graceful degradation -- not just "try-catch the whole thing"
- [ ] **Cost tracking:** Actual per-request cost from response headers, running total, hard budget ceiling -- not just "estimated $7 based on pricing page"
- [ ] **Image normalization:** Format conversion, resize, quality optimization, URL-based delivery -- not just "upload and forward base64"
- [ ] **Rate limiting:** Provider-aware concurrency groups, global RPS budget, exponential backoff with jitter -- not just "semaphore(5) per model"
- [ ] **Report sharing:** UUID-based URLs, no auth required to view, but cannot enumerate other reports -- not just "link to /report/:id"
- [ ] **Model availability:** Pre-flight health check, graceful skip of unavailable models, clear reporting -- not just "try all 20 and hope"
- [ ] **Partial failure recovery:** Per-model result persistence, retry-only-failed capability, user notification -- not just "run it all or fail completely"

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Binary comparison too strict (reports show 0%) | MEDIUM | Add canonicalization layer; re-process existing raw results (stored per-run) with new comparison logic; regenerate affected reports without re-running API calls |
| Rate limit cascade causes incomplete benchmark | LOW | Identify failed models from per-model result records; re-run only failed models; merge results into existing report |
| Payment succeeded, benchmark failed entirely | MEDIUM | Detect from database (payment record exists, benchmark record missing or stuck); auto-trigger re-run; if re-run fails, auto-refund via Stripe API |
| SSE not streaming (buffering) | LOW | Fix server-side Response pattern; existing reports unaffected (data in database); only UX during processing is degraded |
| API cost overrun on specific report | LOW | Flag report in database; investigate which model(s) caused overrun; adjust max_tokens or model tier allocation; absorb cost for this report |
| Model deprecated or renamed on OpenRouter | LOW | Update model ID in registry; re-run affected benchmark if within 30 days (user notified); future reports use new ID automatically |
| Image format not supported | LOW | Add conversion support; ask user to re-upload in supported format; no financial loss since benchmark hasn't started |
| Client disconnection during benchmark | NONE (if built correctly) | Results are in database; user returns to completed or in-progress report; SSE reconnects automatically via EventSource |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Binary exact-match too strict | Phase 1: Core Engine | Test with real model outputs from 5+ models; >70% of semantically-correct responses should pass canonicalized comparison |
| OpenRouter rate limit cascade | Phase 1: Core Engine | Run full 20-model benchmark 3 times without any 429-induced failures; measure P95 execution time <3 min |
| Payment-benchmark decoupling | Phase 2: Payment Pipeline | Kill the benchmark process midway; verify payment record, partial results, and retry capability all work |
| SSE buffering on Vercel | Phase 1: Core Engine | Deploy minimal SSE endpoint to Vercel; verify chunks arrive incrementally (not batched) in browser DevTools Network tab |
| API cost overrun | Phase 1: Core Engine | Run 10 benchmark reports; verify actual cost per report is within $5-$8 range; no report exceeds $10 |
| Vercel 800s timeout | Phase 1: Core Engine | Time full benchmark runs; verify P95 completes within 600s; hard timeout at 700s saves partial results |
| Structured output support variance | Phase 1: Core Engine | Test all 20 models for structured output support; document which tier each model falls into; verify JSON extraction works for all tiers |
| Image handling complexity | Phase 1: Upload Pipeline | Upload HEIC, PDF, large PNG, small JPEG; verify all are normalized to consistent format and size before API calls |
| Model availability changes | Phase 1: Core Engine | Simulate model unavailability (mock 404 for 3 models); verify benchmark completes with 17/20 models and report shows 3 as "unavailable" |
| Client disconnection | Phase 2: Real-time Delivery | Start benchmark via SSE; disconnect network; reconnect; verify results are in database and SSE resumes |

## Sources

- [OpenRouter API Rate Limits](https://openrouter.ai/docs/api/reference/limits) -- MEDIUM confidence (official docs but sparse on specifics)
- [OpenRouter Structured Outputs](https://openrouter.ai/docs/guides/features/structured-outputs) -- HIGH confidence (official docs)
- [OpenRouter Image Inputs](https://openrouter.ai/docs/guides/overview/multimodal/images) -- HIGH confidence (official docs)
- [OpenRouter Model Fallbacks](https://openrouter.ai/docs/guides/features/model-routing) -- HIGH confidence (official docs)
- [Vercel Fluid Compute](https://vercel.com/docs/fluid-compute) -- HIGH confidence (official docs)
- [Vercel Function Duration Limits](https://vercel.com/docs/functions/configuring-functions/duration) -- HIGH confidence (official docs, Pro max = 800s)
- [Fixing Slow SSE Streaming in Next.js and Vercel](https://medium.com/@oyetoketoby80/fixing-slow-sse-server-sent-events-streaming-in-next-js-and-vercel-99f42fbdb996) -- MEDIUM confidence (Jan 2026, single source but aligns with GitHub discussions)
- [Next.js SSE Discussion #48427](https://github.com/vercel/next.js/discussions/48427) -- MEDIUM confidence (community consensus on buffering issue)
- [Vercel Community: SSE ReadableStream cancel issue](https://community.vercel.com/t/server-sent-events-readablestream-not-calling-cancel-method/10291) -- LOW confidence (community report, not officially confirmed)
- [Stripe Webhooks Best Practices](https://www.stigg.io/blog-posts/best-practices-i-wish-we-knew-when-integrating-stripe-webhooks) -- MEDIUM confidence (multiple sources agree on patterns)
- [Stripe Process Undelivered Events](https://docs.stripe.com/webhooks/process-undelivered-events) -- HIGH confidence (official Stripe docs)
- [OpenRouter Rate Limits Zendesk](https://openrouter.zendesk.com/hc/en-us/articles/39501163636379-OpenRouter-Rate-Limits-What-You-Need-to-Know) -- MEDIUM confidence (official support article; $1 = 1 RPS, max 500 RPS)
- [LLM Structured Output Benchmark Issues](https://cleanlab.ai/blog/structured-output-benchmark/) -- LOW confidence (single source, but relevant domain insight)
- [Supabase Storage Limits](https://supabase.com/docs/guides/storage/uploads/file-limits) -- HIGH confidence (official docs; free tier 50MB max file, 1GB storage)

---
*Pitfalls research for: Paid vision model benchmarking SaaS (ModelPick)*
*Researched: 2026-02-11*
