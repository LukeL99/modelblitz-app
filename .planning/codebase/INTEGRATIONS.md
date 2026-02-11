# External Integrations

**Analysis Date:** 2026-02-11

## APIs & External Services

**Vision Model Benchmarking:**
- OpenRouter API - Provides access to 20 vision models for structured data extraction benchmarking
  - SDK/Client: Not directly imported (backend service handles OpenRouter calls)
  - Models tested: Google Gemini, OpenAI GPT, Anthropic Claude, Meta Llama, Mistral, Qwen, and others
  - Use case: 50 runs per model × 20 models = 1,000 API calls per benchmarking session

**Payment Processing:**
- Stripe - Payment processor for $14.99 one-time reports and $7.50/mo subscription
  - SDK/Client: Not directly imported in frontend (assumed handled by backend checkout)
  - Integration point: Checkout flow mentioned in product spec, not yet implemented in frontend code
  - Status: Design-stage (no Stripe SDK imports found in codebase)

## Data Storage

**Databases:**
- Not detected in frontend codebase

**File Storage:**
- Local filesystem only - User uploads 3 sample images (JPG, PNG, PDF formats)
  - No cloud storage integration detected
  - Image handling: Client-side file inputs assumed, actual storage assumed backend-managed

**Caching:**
- None detected

## Authentication & Identity

**Auth Provider:**
- Custom or none - Product spec: "No API keys needed · No account required"
  - Implementation: One-time payment model, no persistent user accounts
  - Session/state: Demo mode uses hardcoded report ID (`demo-123`)

## Monitoring & Observability

**Error Tracking:**
- None detected in frontend codebase

**Logs:**
- Console logging only (client-side, no external logging service detected)

## CI/CD & Deployment

**Hosting:**
- Not configured in codebase (assumed external deployment)
- Build target: Static `dist/` folder (Vite output)
- Domain: modelpick.ai, modelpick-demo.lukelibraro.com (from README)

**CI Pipeline:**
- None detected in codebase

## Environment Configuration

**Required env vars:**
- None required for frontend (API keys assumed server-side only)

**Secrets location:**
- Not applicable (frontend-only application)

## Webhooks & Callbacks

**Incoming:**
- Benchmark completion webhook (assumed backend → frontend via WebSocket for real-time progress)
- Payment webhook from Stripe (assumed backend-only, not visible in frontend)

**Outgoing:**
- OpenRouter API calls (backend → OpenRouter, 1,000 calls per report)

## Backend Services (Inferred from Product Spec)

**Python + FastAPI Backend:**
- Handles OpenRouter API orchestration
- Manages payment processing with Stripe
- WebSocket streaming for real-time benchmark progress
- Runs 20 models × 50 iterations, captures:
  - Full JSON output
  - Response time (total latency)
  - Token count
  - Cost calculation from OpenRouter pricing
  - Binary exact-match pass/fail against expected JSON

**Real-time Communication:**
- WebSocket - Used for streaming benchmark progress to frontend as each model completes
  - Expected duration: 8-15 minutes per report
  - No WebSocket library detected in React dependencies (assumed native browser WebSocket API)

---

*Integration audit: 2026-02-11*
