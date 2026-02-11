# Phase 2: Pay and Run - Context

**Gathered:** 2026-02-11
**Status:** Ready for planning

<domain>
## Phase Boundary

User can pay $14.99 via Stripe and the system executes benchmarks across up to 24 vision models with real-time cost control. Includes Stripe Checkout (hosted), webhook-triggered execution, OpenRouter model calls, JSON comparison with matching modes, and per-report cost management. Real-time progress UI and full report display are Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Debug & mock infrastructure
- Environment variables for mock toggling: `DEBUG_MOCK_STRIPE=true`, `DEBUG_MOCK_OPENROUTER=true`, `DEBUG_MOCK_EMAIL=true`
- Sandbox keys: `DEBUG_STRIPE_SECRET_KEY`, `DEBUG_STRIPE_WEBHOOK_SECRET` — used when corresponding mock is `false`, pointing at Stripe sandbox
- Visual debug indicator in UI when any mock is active (shows which services are mocked)
- Mock OpenRouter returns realistic data: varied accuracy scores, different latencies per model, some partial failures — simulates real benchmarking behavior
- Mock mode includes error simulation: rate limits, timeouts, bad JSON to exercise error handling and backoff logic
- Mock Stripe skips the redirect entirely — clicking "Pay" immediately creates a paid session and lands on processing page for faster dev loop

### Checkout flow
- Confirmation screen before Stripe redirect: summarizes benchmark config (models selected, image count, run count) with $14.99 flat price
- Price shown is $14.99 only — no API cost breakdown, no budget info shown to user
- After Stripe redirect back: simple "Your benchmark is running..." with spinner (Phase 3 replaces with live progress)
- Payment failure or cancellation: dedicated error page with "Try Again" button that re-initiates checkout (not back to wizard)

### Accuracy scoring
- Two matching modes: strict (binary exact-match) and relaxed (toggle)
- Relaxed mode — loose coercion: string `"1"` = number `1` = `1.0` (semantically same value passes)
- Relaxed mode — whitespace: collapse/normalize whitespace but preserve casing (`"New York"` != `"new york"`, but `"New  York"` = `"New York"`)
- Null handling: strict mode distinguishes `null` value vs missing key (mismatch). Relaxed mode treats them as equivalent.
- Two accuracy metrics reported: field-level accuracy % (correct fields / total fields) AND binary exact-match rate across runs

### Cost management
- Pre-calculate total budget before execution: images x models x token cost per run (input tokens per image per model + output tokens based on expected JSON size)
- Target budget to stay just under $7 API cost per report
- If projected cost exceeds budget: reduce number of runs per model to fit within $7
- If even 1 run per model exceeds budget: prompt user to remove models or reduce images before execution
- Hard ceiling at $15 total API cost — abort if reached (should be very rare given accurate pre-calculation)
- Log actual token consumption and cost per run in database — track predicted vs actual for cost model accuracy
- Cost data is strictly internal — users see runs, images, and models in their reports, never costs or margins

### Claude's Discretion
- Debug indicator design (corner badge vs banner vs other)
- Mock response data specifics (realistic but Claude picks the actual values/patterns)
- Error page design and copy
- Confirmation screen layout
- Processing page spinner/animation style

</decisions>

<specifics>
## Specific Ideas

- "We promised them a refund if the report fails to generate, I just don't want to operate at a loss" — cost controls protect margin, not user-facing
- "$15 would be a huge overrun, so our budgeting needs to be accurate (which should be easy based on OpenRouter pricing)" — pre-calculation accuracy is critical
- Cost transparency is one-directional: users see what they get (runs, images, models), never what it costs us
- Future admin dashboard for cost/margin reporting (not this phase)

</specifics>

<deferred>
## Deferred Ideas

- Admin reporting dashboard for cost tracking and margin analysis — future phase
- Cost model accuracy improvements based on logged actual vs predicted data — operational concern, not a phase

</deferred>

---

*Phase: 02-pay-and-run*
*Context gathered: 2026-02-11*
