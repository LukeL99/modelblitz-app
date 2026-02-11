# Feature Research

**Domain:** Paid vision model benchmarking report for structured data extraction
**Researched:** 2026-02-11
**Confidence:** MEDIUM -- Based on analysis of Artificial Analysis, Roboflow Playground, Promptfoo, Vellum, Braintrust, OmniAI benchmark, Cleanlab, Businessware IDP benchmark, and Veryfi. No direct competitor exists selling one-shot paid benchmarking reports for vision model structured extraction, so findings are synthesized from adjacent products (evaluation platforms, leaderboards, OCR benchmarking tools, and report-as-product SaaS patterns).

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or untrustworthy.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Image upload with preview** | Users need to see their images are correctly uploaded before paying $15. Every file-handling SaaS shows previews. | LOW | Drag-and-drop + thumbnails. Support JPG/PNG/WebP/PDF. Already in prototype. |
| **Expected JSON input with validation** | Users must define ground truth. Invalid JSON = wasted money. Syntax highlighting and live validation are minimum bar. | LOW | Already in prototype as textarea. Add JSON syntax validation with error highlighting before payment. |
| **Ranked results table** | Every benchmark product (Artificial Analysis, Roboflow, OmniAI) presents a sortable table. Users expect to scan and compare at a glance. | LOW | Sortable by accuracy, cost, speed. Already in prototype. |
| **Accuracy metric (exact-match)** | The core metric. Users pay $15 to know "does this model extract my data correctly?" Binary pass/fail per run, aggregated to percentage. | LOW | Already in prototype. This IS the product. |
| **Cost per run** | Users are choosing between models to deploy. They need to know per-unit economics. Artificial Analysis, OmniAI benchmark, and every LLM comparison surface this. | LOW | Pulled from OpenRouter pricing at report time. Already in prototype. |
| **Response time metrics (median + P95)** | Speed matters for production deployment. Median shows typical, P95 shows worst case. Standard in Artificial Analysis and Vellum comparisons. | LOW | Already in prototype. P95 + median + spread (IQR). |
| **Shareable report link** | Users will share results with teammates, CTOs, or on Twitter. Every report product (SiteCapture, Visme, modern SaaS) provides shareable URLs. | LOW | Unique URL, no auth required to view. Already designed in prototype. |
| **Stripe payment (one-time)** | Users expect a clean, trustworthy checkout. Stripe Checkout is the expected standard for indie/micro-SaaS. Custom card forms reduce trust. | MEDIUM | Use Stripe Checkout (hosted page), NOT custom card form. Prototype currently has a fake inline form -- replace with real Stripe Checkout redirect. |
| **Email receipt with report link** | After paying $15, users expect a receipt and a way to find their report later. Standard e-commerce behavior. | LOW | Transactional email via Resend. Include report link, summary stats, receipt. |
| **Real-time progress during benchmark** | 1,000 API calls takes 1-2 minutes. Users who just paid $15 need reassurance it is working. Streaming results prevent "did it break?" anxiety. | MEDIUM | WebSocket streaming. Show model-by-model completion with live accuracy updates. Already designed in prototype. |
| **Mobile-responsive report** | Many users will open the shared link on mobile. Report must be readable. | LOW | Tailwind responsive classes. Test table and chart rendering at 375px width. |

### Differentiators (Competitive Advantage)

Features that set ModelPick apart from free leaderboards and developer evaluation tools. These justify the $14.99 price.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **"Where It Missed" field-level error diffs** | No leaderboard or evaluation platform shows exactly which JSON field a model gets wrong and what it returned instead. Cleanlab identifies fields with low trust scores, but does not show expected vs actual diffs for YOUR data. This is the killer feature that justifies paying vs using free leaderboards. | MEDIUM | Per-model expandable section: "tax_total: got 42.50, expected 42.55" + aggregated patterns ("misses tax field 30% of the time"). Side-by-side JSON diff with highlighted differences. Already in prototype. |
| **YOUR data, not generic benchmarks** | Artificial Analysis tests generic tasks. OmniAI tests their standard dataset. Promptfoo requires YAML config and CLI. ModelPick tests YOUR receipts, YOUR invoices, YOUR schema -- via a web form. The gap between "GPT-4o scores 92% on MMMU" and "GPT-4o scores 78% on MY receipt format" is the entire value proposition. | LOW (architecturally) | This is a product positioning feature, not a technical one. The benchmark engine tests user-uploaded data by design. |
| **Configurable testing plan wizard** | Let users trade off budget vs statistical rigor. Priority ranking (accuracy > speed > cost), model selection, sample count within ~$7 API budget. No other product gives this level of control in a consumer-friendly wizard. | HIGH | Progressive disclosure: simple defaults with "customize" expansion. Budget estimator shows API cost impact in real-time. Replaces fixed 3x50x20 with user-controlled parameters. |
| **Bubble chart visualization (cost vs accuracy vs speed)** | Four dimensions in one chart (x=cost, y=accuracy, size=speed, opacity=consistency). Artificial Analysis has scatter plots, but theirs are for generic benchmarks. ModelPick's chart shows YOUR use case results. | MEDIUM | CSS-based implementation. Already in prototype. Key: make it interactive -- hover for details, click to focus. |
| **Cost calculator with "switching saves $X/month"** | Turns abstract benchmark data into a concrete business decision. No evaluation tool does this. "Switching from GPT-4o to Gemini Flash saves $144/month at 1,000 extractions/day" is the moment users share the report with their team. | LOW | Slider for daily volume + dropdown for current model. Dynamic savings computation. Already in prototype. |
| **Relaxed matching toggle** | Binary exact-match is strict. Some users want to know "close enough" accuracy (e.g., whitespace differences, number formatting "42.5" vs "42.50"). Toggle between strict and relaxed modes on the same report. | MEDIUM | Normalize whitespace, trailing zeros, quote styles, key ordering before comparison. Show both scores. Mentioned in PRD as risk mitigation for "everything looks 0%". |
| **Schema auto-detection from examples** | System infers JSON schema from user-provided expected outputs. Reduces input friction -- user pastes JSON, system figures out the schema. Progressive disclosure: paste JSON, system shows "We detected these fields: merchant, date, total, line_items[]. Correct?" | MEDIUM | Parse JSON examples, extract field names/types/nesting. Use for prompt generation and error reporting. |
| **Aggregated error patterns** | Beyond per-run diffs: "Claude Haiku misses the tax field 30% of the time" and "All models struggle with line_item quantities." Pattern detection across all runs for a model, and across all models for a field. | MEDIUM | Requires aggregation logic post-benchmark. Group errors by field name and by model. Surface top-3 patterns per model. |
| **Internal generic leaderboard powering presets** | Run standard benchmarks internally, use results to power "recommended model presets" and validate model availability. Not user-facing as a feature, but enables smart defaults in the wizard. | MEDIUM | Background process. Test standard receipt/invoice/form datasets. Update model presets weekly. Users see: "Based on our internal testing, these 8 models are best for receipts." |
| **PDF export** | Some users need to attach reports to internal documents, procurement decisions, or client deliverables. PDF export is expected for paid reports. | MEDIUM | Server-side PDF generation (Puppeteer or equivalent). Include all report sections. Already referenced in prototype UI but not implemented. |
| **OpenRouter baseline comparison** | "Your benchmark took 2.1s median, but OpenRouter's global median for this model is 1.4s -- your document may be more complex than average." Contextualizes results. No other tool does this. | LOW | Fetch OpenRouter global medians at report time. Show side-by-side bar comparison. Already in prototype. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems for a $14.99 one-shot report product targeting indie devs.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Bring-your-own API keys** | Power users want to test with their own keys to avoid paying $15. Enterprise users may have negotiated pricing. | Eliminates the business model. Users with API keys can already test manually (which is the problem we solve). Also introduces key security liability, rate limit variability, and unpredictable costs. | Keep it simple: we handle API calls. If enterprise demand emerges later, consider a separate tier. |
| **Real-time model monitoring / ongoing dashboards** | Users want to know when model performance degrades over time. | Turns a one-shot product into an infrastructure platform. Completely different product with subscription economics, uptime obligations, and engineering complexity 10x the MVP. | Offer the $7.50/mo subscription for new-model-only re-benchmarks. Suggest users re-run a report quarterly. |
| **Non-vision / text-only LLM benchmarking** | "Can I also benchmark text prompts?" is a natural question. | Dilutes the focus. The structured data extraction niche is specific enough to be a clear value prop. Text-only LLM benchmarking is a crowded space (Promptfoo, Braintrust, Vellum are all free for this). | Stay focused on vision model structured extraction. Consider text-only only after establishing PMF in vision. |
| **Custom evaluation metrics / LLM-as-judge** | Evaluation platforms (Vellum, Promptfoo, Opik) offer custom metrics, semantic similarity, LLM-as-judge scoring. | Over-engineers the product. Binary exact-match is the differentiator -- it is simple, trustworthy, and unambiguous. Custom metrics require explanation, calibration, and create "what does this score even mean?" confusion. | Binary exact-match + relaxed matching toggle covers 95% of use cases. If partial credit is needed, show it as supplementary info in error diffs, not as a primary metric. |
| **Prompt engineering / optimization** | Users want help writing better extraction prompts. | Turns benchmarking into consulting. Prompt optimization is subjective, model-specific, and requires deep domain knowledge. Also creates liability ("your prompt suggestion made my pipeline worse"). | ModelPick generates a standard extraction prompt from the schema. If users want prompt A/B testing, that is a v2+ feature with clear scope. |
| **Team accounts / collaboration** | "Can my team access this?" | Premature for MVP. Adds auth complexity, RBAC, billing changes. Shareable links already solve 80% of the collaboration need. | Shareable links (no auth). Team plans only if >20% of users request it post-launch. |
| **Enterprise features (SSO, audit logs, compliance)** | Enterprise buyers expect these. | Wrong market. ModelPick targets indie hackers and micro-SaaS at $14.99. Enterprise sales cycles, compliance requirements, and support expectations are incompatible with a passive income product. | Explicitly position as NOT enterprise. If enterprise demand materializes organically, consider a separate offering at a different price point. |
| **Subscription-only pricing model** | Recurring revenue is better than one-time. | Users evaluating models need a point-in-time answer, not ongoing monitoring. Subscription friction kills conversion for a $15 decision. The monthly update add-on is the right balance. | One-time $14.99 report + optional $7.50/mo new-model updates. Do not gate the initial report behind a subscription. |
| **Self-hosted / on-prem** | Data-sensitive users want to run benchmarks on their infrastructure. | Requires packaging the entire backend, OpenRouter integration, and all 20 model connections as a deployable product. 50x complexity increase. | Position as a web service. For extremely sensitive data, suggest users anonymize/redact sample images before upload. |

## Feature Dependencies

```
[Image Upload + JSON Input]
    |
    +--requires--> [JSON Validation]
    |
    +--requires--> [Schema Auto-Detection] --enhances--> [Prompt Generation]
    |
    +--feeds--> [Benchmark Engine]
                    |
                    +--requires--> [Stripe Payment] (must pay before running)
                    |
                    +--requires--> [OpenRouter API Integration]
                    |
                    +--produces--> [Raw Run Data]
                                      |
                                      +--feeds--> [Ranked Table]
                                      |
                                      +--feeds--> [Accuracy Calculation]
                                      |               |
                                      |               +--enhances--> [Relaxed Matching Toggle]
                                      |
                                      +--feeds--> [Field-Level Error Diffs]
                                      |               |
                                      |               +--enhances--> [Aggregated Error Patterns]
                                      |
                                      +--feeds--> [Bubble Chart]
                                      |
                                      +--feeds--> [Cost Calculator]
                                      |
                                      +--feeds--> [OpenRouter Baseline Comparison]
                                      |
                                      +--feeds--> [PDF Export]
                                      |
                                      +--feeds--> [Shareable Link]
                                      |
                                      +--feeds--> [Email Receipt + Report Link]

[Real-time Progress] --requires--> [WebSocket] --requires--> [Benchmark Engine]

[Configurable Testing Plan Wizard]
    |
    +--enhances--> [Benchmark Engine] (model selection, run count, priority)
    |
    +--informed-by--> [Internal Leaderboard] (smart defaults/presets)

[Auth (Supabase)] --enables--> [Past Reports Dashboard]
                  --enables--> [Monthly Subscription Management]
```

### Dependency Notes

- **Benchmark Engine requires Stripe Payment:** Payment must complete before API calls begin. This is a hard gate -- no free tier, no trial runs.
- **Relaxed Matching Toggle enhances Accuracy Calculation:** Both strict and relaxed scores computed from the same raw run data. Relaxed matching is a view toggle, not a re-run.
- **Schema Auto-Detection enables better Prompt Generation:** Detected schema informs the extraction prompt sent to models. Without it, prompt is generic "extract structured data as JSON."
- **Internal Leaderboard informs Wizard Defaults:** Presets like "Best for receipts" come from internal benchmark runs, not guesses. Requires periodic internal benchmarking.
- **PDF Export and Shareable Link both feed from the same Report Data:** Single data model, two output formats.
- **Auth (Supabase) is NOT required for MVP report delivery:** Reports delivered via unique URL + email. Auth enables past reports dashboard and subscription management as post-MVP additions.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what is needed to validate that people will pay $14.99 for a vision model benchmarking report.

- [ ] **Image upload with preview** -- Users must be able to upload 3 sample images with drag-and-drop and thumbnail preview
- [ ] **Expected JSON input with live validation** -- Textarea with syntax validation, error highlighting, and clear error messages
- [ ] **Benchmark engine (fixed 20 models x 50 runs)** -- Start with fixed configuration, not configurable wizard
- [ ] **Stripe Checkout (hosted, not inline)** -- Use Stripe Checkout redirect for trust and simplicity
- [ ] **Real-time progress via WebSocket** -- Model-by-model streaming with live accuracy updates
- [ ] **Ranked results table** -- Sortable by accuracy, cost, speed
- [ ] **Top recommendation card** -- "For your use case, use X because Y"
- [ ] **Bubble chart (cost vs accuracy)** -- Interactive with hover tooltips
- [ ] **Field-level error diffs ("Where It Missed")** -- Expandable per model, side-by-side JSON diff
- [ ] **Cost calculator** -- Daily volume slider + current model dropdown = "saves $X/month"
- [ ] **Shareable link (unique URL, no auth)** -- Copy-to-clipboard, viewable without login
- [ ] **Email receipt with report link** -- Transactional email on payment + report completion
- [ ] **Binary exact-match accuracy** -- Core metric, no fuzzy scoring in v1

### Add After Validation (v1.x)

Features to add once core is working and first 50 reports are sold.

- [ ] **Auth via Supabase** -- Trigger: users ask "where is my old report?" Enable social login, magic link, email/password
- [ ] **Past reports dashboard** -- Trigger: users run 2+ reports. Show history with report summaries
- [ ] **Relaxed matching toggle** -- Trigger: users complain about 0% accuracy due to whitespace/formatting differences
- [ ] **Schema auto-detection** -- Trigger: users struggle with JSON input. "We detected these fields" confirmation step
- [ ] **PDF export** -- Trigger: users say "I need to show this to my boss." Server-side PDF generation
- [ ] **Aggregated error patterns** -- Trigger: users with >5% error rates want to understand systemic failures
- [ ] **Monthly subscription ($7.50/mo) for new model updates** -- Trigger: new models release and users ask to re-test
- [ ] **OpenRouter baseline comparison** -- Trigger: users question whether response times are normal

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Configurable testing plan wizard** -- Defer because fixed 20x50 is simpler to build, simpler to price, and establishes the benchmark quality bar. Add when users request smaller/larger runs.
- [ ] **Internal generic leaderboard** -- Defer because it requires ongoing API spend and infrastructure. Build once there is revenue to fund it.
- [ ] **Batch documents (10+ images)** -- Defer because 3 images is sufficient for MVP validation. More images = higher API cost = pricing change needed.
- [ ] **A/B prompt testing** -- Defer because it is a different product (prompt engineering tool, not model benchmarking).
- [ ] **API access for CI/CD** -- Defer because target users are not running automated pipelines yet. They are choosing a model.
- [ ] **Multi-page PDF support** -- Defer because it adds complexity to the extraction pipeline and most target users work with single-page receipts/invoices.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Image upload + preview | HIGH | LOW | P1 |
| JSON input + validation | HIGH | LOW | P1 |
| Benchmark engine (20x50) | HIGH | HIGH | P1 |
| Stripe Checkout (hosted) | HIGH | MEDIUM | P1 |
| WebSocket progress | HIGH | MEDIUM | P1 |
| Ranked table (sortable) | HIGH | LOW | P1 |
| Top recommendation card | HIGH | LOW | P1 |
| Bubble chart | MEDIUM | MEDIUM | P1 |
| Field-level error diffs | HIGH | MEDIUM | P1 |
| Cost calculator | MEDIUM | LOW | P1 |
| Shareable link | HIGH | LOW | P1 |
| Email receipt | HIGH | LOW | P1 |
| Relaxed matching toggle | MEDIUM | MEDIUM | P2 |
| Auth (Supabase) | MEDIUM | MEDIUM | P2 |
| Past reports dashboard | MEDIUM | LOW | P2 |
| Schema auto-detection | MEDIUM | MEDIUM | P2 |
| PDF export | MEDIUM | MEDIUM | P2 |
| Aggregated error patterns | MEDIUM | MEDIUM | P2 |
| OpenRouter baseline comparison | LOW | LOW | P2 |
| Monthly subscription | MEDIUM | MEDIUM | P2 |
| Configurable wizard | MEDIUM | HIGH | P3 |
| Internal leaderboard | LOW | HIGH | P3 |
| Batch documents (10+) | LOW | MEDIUM | P3 |
| A/B prompt testing | LOW | HIGH | P3 |
| API access | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch -- without these, the product does not deliver its promise
- P2: Should have, add when possible -- these improve retention and justify the price
- P3: Nice to have, future consideration -- these expand the product scope

## Competitor Feature Analysis

| Feature | Artificial Analysis | OmniAI Benchmark | Promptfoo | Vellum | Roboflow | ModelPick |
|---------|--------------------|--------------------|-----------|--------|----------|-----------|
| Custom user data | No (generic benchmarks) | No (standard dataset) | Yes (YAML config) | Yes (test cases) | Yes (custom dataset) | **Yes (image upload + JSON)** |
| Vision model focus | Partial (text-centric) | Yes (OCR-specific) | Partial | Partial | Yes (object detection) | **Yes (structured extraction)** |
| Field-level error diffs | No | No (aggregate only) | No | No | No | **Yes (killer feature)** |
| Cost comparison | Yes (pricing tables) | Yes (per-provider) | No | No | No | **Yes (per-run + calculator)** |
| Paid report | No (free) | No (free/open-source) | No (free/open-source) | Yes (subscription) | Yes (subscription) | **Yes ($14.99 one-time)** |
| No setup required | Yes (web browse) | No (GitHub/CLI) | No (CLI + YAML) | No (platform signup) | Partial (signup required) | **Yes (web form only)** |
| Statistical rigor (50+ runs) | No (single evaluation) | No (single run) | Configurable | Configurable | No | **Yes (50 runs default)** |
| Real-time progress | N/A | N/A | CLI output | Yes | N/A | **Yes (WebSocket)** |
| Shareable reports | N/A | GitHub | No | Yes (team) | Yes (team) | **Yes (unique URL)** |
| Binary accuracy | N/A | JSON diff-based | Configurable | Configurable | mAP/F1 | **Yes (exact-match)** |
| Pricing | Free | Free | Free + paid tiers | $249+/mo | $249+/mo | **$14.99 one-time** |

**Key insight from competitor analysis:** The competitive landscape splits into two categories:
1. **Free leaderboards/benchmarks** (Artificial Analysis, OmniAI, Promptfoo) -- generic data, no field-level diffs, no cost calculator, require technical setup
2. **Paid evaluation platforms** (Vellum, Braintrust, Roboflow) -- subscription-based ($249+/mo), aimed at teams, general-purpose

ModelPick occupies an empty middle: paid but cheap ($14.99), specific (vision + structured extraction), zero-setup (web form), and uniquely shows field-level error diffs on YOUR data. There is no direct competitor.

## Sources

- [Artificial Analysis - AI Model Comparison](https://artificialanalysis.ai/models) -- MEDIUM confidence. Free platform comparing AI models on intelligence, price, speed. No custom data testing.
- [OmniAI OCR Benchmark (GitHub)](https://github.com/getomni-ai/benchmark) -- MEDIUM confidence. Open-source OCR benchmark comparing providers. JSON diff-based accuracy but requires CLI/GitHub setup.
- [Promptfoo](https://www.promptfoo.dev/docs/intro/) -- MEDIUM confidence. Open-source LLM evaluation CLI. Powerful but requires YAML config and developer setup.
- [Vellum AI Evaluation Platform](https://www.vellum.ai/products/evaluation) -- MEDIUM confidence. Enterprise evaluation platform with playground and comparison features. $249+/mo.
- [Roboflow Playground](https://playground.roboflow.com/ranking) -- MEDIUM confidence. Vision model comparison with custom data. Object detection focused, not structured extraction.
- [Cleanlab Structured Output Benchmark](https://cleanlab.ai/blog/tlm-structured-outputs-benchmark/) -- HIGH confidence. Field-level trust scores and error detection for structured outputs. Academic/research focus, not a consumer product.
- [Businessware IDP Benchmark](https://www.businesswaretech.com/intelligent-document-processing-benchmark) -- MEDIUM confidence. Monthly IDP model benchmarking with field-level accuracy across document types.
- [Veryfi Accuracy Benchmarks](https://www.veryfi.com/technology/line-item-extraction-accuracy-benchmarks/) -- MEDIUM confidence. Receipt extraction accuracy methodology with field-level metrics.
- [Braintrust AI](https://www.braintrust.dev/) -- LOW confidence. Evaluation platform (limited research depth). Integrates evals, prompt management, monitoring.
- [Epoch AI Benchmarks](https://epoch.ai/benchmarks) -- LOW confidence. Academic benchmark database. Not a product comparison.

---
*Feature research for: Vision model structured data extraction benchmarking report*
*Researched: 2026-02-11*
