# Curated Vision Models for OCR/Structured Data Extraction Benchmarking

> **Generated:** 2026-02-11
> **Purpose:** Select top-performing vision models per price tier for receipt/invoice/document → JSON extraction benchmarking in ModelPick
> **Total models selected:** 24

## Methodology & Sources

Selection based on cross-referencing multiple sources:

1. **Fraunhofer IAIS Invoice Benchmark (2025)** — Benchmarked GPT-5, Gemini 2.5, and Gemma 3 families on 3 invoice datasets. Gemini 2.5 Pro achieved highest accuracy: 87.46% (scanned receipts), 96.50% (clean invoices), 92.71% (scanned invoices). Native image processing outperformed text-first approaches.
2. **Omni OCR Benchmark** — 1,000-document JSON extraction benchmark. Qwen 2.5 VL 72B & 32B achieved ~75% (matching GPT-4o). Gemma-3 27B surprisingly poor at 42.9%. Llama 4 Maverick later overtook Qwen as top open-source.
3. **Koncile Invoice Extraction Comparison (Aug 2025)** — GPT: 98% on text PDFs, Claude: 97%, Gemini: 96%. On scanned invoices: Gemini 94%, GPT 91%, Claude 90%.
4. **AIMultiple OCR Benchmark (2026)** — Gemini 2.5 Pro, Google Vision, and Claude Sonnet 4.5 tied for highest OCR accuracy scores.
5. **Roboflow GPT-5 Vision Evaluation (Aug 2025)** — GPT-5 tied for #1 on Vision Checkup with o4 Mini. Strong on document understanding/OCR.
6. **OmniDocBench 1.5 (Nov 2025)** — OCR Edit Distance: Gemini 3 Pro 81.4%, Gemini 2.5 Pro 69.6%, Claude Sonnet 4.5 68.5%, GPT-5.1 69.5%.
7. **Community reports (Reddit r/LocalLLaMA, r/Bard)** — Gemini 2.0 Flash achieving 98-99% on specific OCR tasks; Gemini 3 Flash scoring 100% on internal OCR benchmarks; Llama 4 Maverick reaching 95% accuracy.
8. **Mistral OCR 3 (Dec 2025)** — SOTA document parsing, double-digit accuracy lead over Azure AI and AWS Textract on handwriting/tables. (Note: Mistral OCR is a dedicated OCR API, not a general VLM on OpenRouter.)

### Key Findings
- **Gemini family dominates OCR/document extraction** — 2.0 Flash, 2.5 Pro, 3 Flash, and 3 Pro are all top-tier
- **Qwen VL models are the best open-source option** — Qwen 2.5 VL 72B matches GPT-4o; Qwen3 VL improves further
- **GPT-5 family is strong but not best-in-class for OCR** — Excellent reasoning helps, but Gemini has edge on visual text
- **Gemma 3 is surprisingly weak at OCR** — Despite similar architecture to Gemini 2.0, it scored only 42.9%
- **Claude excels at structured JSON output consistency** — Best format reliability, but slightly behind on raw OCR accuracy
- **Llama 4 Maverick is the open-source dark horse** — Overtook Qwen 2.5 VL as top open-source OCR model

---

## Free Tier

| Model | Provider | Input $/1M | Output $/1M | PDF | Why Selected | OCR Notes |
|-------|----------|-----------|------------|-----|--------------|-----------|
| Mistral: Mistral Small 3.1 24B (free) | mistralai | Free | Free | ❌ | Best free vision model; Mistral's vision capabilities are solid for the size | Decent OCR for a free model; won't match paid tiers but good baseline |
| Google: Gemma 3 27B (free) | google | Free | Free | ❌ | Largest free model; important to test as "free ceiling" | ⚠️ **Surprisingly poor at OCR (42.9% on Omni benchmark)** despite Gemini-derived architecture. Must-test to confirm |
| NVIDIA: Nemotron Nano 12B 2 VL (free) | nvidia | Free | Free | ❌ | NVIDIA's entry; test as potential dark horse | Limited OCR benchmarks available; worth testing as free alternative |
| Google: Gemma 3 12B (free) | google | Free | Free | ❌ | Mid-size free option for size vs accuracy comparison | Likely weaker than 27B; baseline comparison |

> **Free tier caveat:** No free models support PDF input. All are image-only. Expect significantly lower accuracy than paid models. These are mostly useful as "free baseline" comparisons.

---

## Budget Tier (under $0.50/1M input)

| Model | Provider | Input $/1M | Output $/1M | PDF | Why Selected | OCR Notes |
|-------|----------|-----------|------------|-----|--------------|-----------|
| Google: Gemini 2.0 Flash | google | $0.10 | $0.40 | ✅ | **Community reports 98-99% OCR accuracy** — may be best value in entire list | Users report it outperforms even Gemini 2.5 Pro on some OCR tasks. Incredible price/performance |
| Google: Gemini 2.5 Flash | google | $0.30 | $2.50 | ✅ | Top flash-tier model with massive 1M context. Strong OCR inheriting from Gemini family | Excellent for high-volume document processing. PDF support is huge |
| OpenAI: GPT-5 Nano | openai | $0.05 | $0.40 | ✅ | Cheapest GPT-5 variant with PDF support. Test GPT-5 OCR at rock-bottom price | Likely good enough for clean documents; may struggle with low-quality scans |
| OpenAI: GPT-5 Mini | openai | $0.25 | $2.00 | ✅ | Sweet spot of GPT-5 family — near-top accuracy at budget price | GPT-5 Mini benchmarks near GPT-5 full on many vision tasks |
| Qwen: Qwen2.5 VL 72B Instruct | qwen | $0.15 | $0.60 | ❌ | **#1 open-source OCR model** — 75% on Omni benchmark, matching GPT-4o | Optimized for structured vision-language tasks, document parsing, OCR. 96.4% on DocVQA |
| Meta: Llama 4 Maverick | meta-llama | $0.15 | $0.60 | ❌ | **Overtook Qwen as top open-source OCR** — up to 95% accuracy reported | 🏇 Dark horse that became the horse. Huge step up from Llama 3.2 for OCR |
| Qwen: Qwen3 VL 235B A22B Instruct | qwen | $0.20 | $0.88 | ❌ | Latest Qwen VL — should exceed Qwen 2.5 VL benchmarks | 97% on DocVQA for Qwen3 family; MoE architecture keeps cost low |
| OpenAI: GPT-4.1 Nano | openai | $0.10 | $0.40 | ✅ | Proven GPT-4.1 architecture at nano price with PDF support | Good structured output adherence; solid baseline |

> **Budget tier star:** Gemini 2.0 Flash at $0.10 input is absurdly good value for OCR. Qwen 2.5 VL 72B and Llama 4 Maverick are best open-source options.

---

## Mid Tier ($0.50 - $2.99/1M input)

| Model | Provider | Input $/1M | Output $/1M | PDF | Why Selected | OCR Notes |
|-------|----------|-----------|------------|-----|--------------|-----------|
| Google: Gemini 3 Flash Preview | google | $0.50 | $3.00 | ✅ | **100% on internal OCR benchmarks (community)**, outperforms Gemini 3 Pro on OCR | Flash models tend to hallucinate less on OCR than Pro models. Outstanding |
| Google: Gemini 2.5 Pro | google | $1.25 | $10.00 | ✅ | **#1 on Fraunhofer invoice benchmark** (87-97% across datasets). OmniDocBench 69.6% | The proven workhorse for document extraction. Massive 1M context for multi-page docs |
| Google: Gemini 3 Pro Preview | google | $2.00 | $12.00 | ✅ | **#1 on OmniDocBench 1.5 (81.4%)** — best overall OCR edit distance | Spatial reasoning beyond simple OCR. May hallucinate slightly more than Flash on OCR |
| OpenAI: GPT-5 | openai | $1.25 | $10.00 | ✅ | **Tied #1 on Vision Checkup** with o4 Mini. Strong document understanding | Reasoning capabilities help with complex layouts. PDF native support |
| OpenAI: GPT-5.1 | openai | $1.25 | $10.00 | ✅ | Latest GPT-5 series iteration with improvements over base GPT-5 | OmniDocBench 69.5%. Strong all-around but Gemini edges it on pure OCR |
| Anthropic: Claude Haiku 4.5 | anthropic | $1.00 | $5.00 | ❌ | **Best JSON format consistency** — valid JSON 100% of the time | Great when you need reliable structured output. OCR accuracy slightly below Gemini/GPT |

> **Mid tier insight:** Gemini 3 Flash at $0.50 may be the best model on this entire list for OCR. Gemini 2.5 Pro is the proven enterprise choice. GPT-5/5.1 are strong alternatives.

---

## Premium Tier ($3.00 - $9.99/1M input)

| Model | Provider | Input $/1M | Output $/1M | PDF | Why Selected | OCR Notes |
|-------|----------|-----------|------------|-----|--------------|-----------|
| Anthropic: Claude Sonnet 4.5 | anthropic | $3.00 | $15.00 | ✅ | **Tied for highest OCR score (AIMultiple)** with Gemini 2.5 Pro. Best structured output | Excellent balance of OCR accuracy + JSON reliability. PDF support. 1M context |
| Anthropic: Claude Sonnet 4 | anthropic | $3.00 | $15.00 | ✅ | Strong baseline; test if 4.5 improvements matter for OCR specifically | Some reports suggest Sonnet 4 "isn't great for document understanding" vs expectations |
| xAI: Grok 4 | x-ai | $3.00 | $15.00 | ❌ | Strong general reasoning; test as xAI's best vision offering | Limited OCR-specific benchmarks; 100% on τ²-bench Telecom tool-calling. Worth testing |
| Anthropic: Claude Opus 4.6 | anthropic | $5.00 | $25.00 | ❌ | Latest Opus — maximum Anthropic capability | Test if Opus-tier reasoning helps with complex/messy documents |

> **Premium caveat:** At this price tier, Gemini 3 Pro ($2.00) in the Mid tier likely outperforms most Premium models on pure OCR. Premium models shine when you need combined reasoning + extraction.

---

## Ultra Tier ($10+/1M input)

| Model | Provider | Input $/1M | Output $/1M | PDF | Why Selected | OCR Notes |
|-------|----------|-----------|------------|-----|--------------|-----------|
| OpenAI: GPT-5 Pro | openai | $15.00 | $120.00 | ✅ | Maximum GPT capability. Test if Pro-tier reasoning helps OCR | Likely diminishing returns for OCR vs GPT-5 at 12x the price |
| Anthropic: Claude Opus 4 | anthropic | $15.00 | $75.00 | ✅ | Flagship Opus with PDF support | Test as "money is no object" ceiling |

> **Ultra caveat:** For pure OCR/extraction, Ultra models are almost certainly not worth the price premium. Include 1-2 as ceiling benchmarks only.

---

## Final Recommended Benchmark List (24 models)

### By Priority

**Must-test (12 models — these will likely define the Pareto frontier):**
| # | Model | Tier | Input $/1M | PDF | Rationale |
|---|-------|------|-----------|-----|-----------|
| 1 | Gemini 2.0 Flash | Budget | $0.10 | ✅ | Best value; 98-99% OCR reported |
| 2 | Gemini 3 Flash Preview | Mid | $0.50 | ✅ | Potentially best OCR model period |
| 3 | Gemini 2.5 Pro | Mid | $1.25 | ✅ | Proven #1 on Fraunhofer invoice benchmark |
| 4 | Gemini 3 Pro Preview | Mid | $2.00 | ✅ | #1 OmniDocBench; best spatial reasoning |
| 5 | GPT-5 Nano | Budget | $0.05 | ✅ | Cheapest PDF-capable model worth testing |
| 6 | GPT-5 Mini | Budget | $0.25 | ✅ | GPT-5 quality at budget price |
| 7 | GPT-5 | Mid | $1.25 | ✅ | Full GPT-5 capability benchmark |
| 8 | Claude Sonnet 4.5 | Premium | $3.00 | ✅ | Best structured output; tied top OCR |
| 9 | Qwen 2.5 VL 72B | Budget | $0.15 | ❌ | Best open-source OCR baseline |
| 10 | Llama 4 Maverick | Budget | $0.15 | ❌ | Top open-source OCR, 95% accuracy |
| 11 | Qwen3 VL 235B A22B Instruct | Budget | $0.20 | ❌ | Latest Qwen VL; should beat 2.5 |
| 12 | Claude Haiku 4.5 | Mid | $1.00 | ❌ | Cheap Anthropic option; JSON reliability |

**Should-test (8 models — fill out tiers and comparisons):**
| # | Model | Tier | Input $/1M | PDF | Rationale |
|---|-------|------|-----------|-----|-----------|
| 13 | GPT-4.1 Nano | Budget | $0.10 | ✅ | Proven architecture, cheap |
| 14 | Gemini 2.5 Flash | Budget | $0.30 | ✅ | Compare vs 2.0 Flash and 3 Flash |
| 15 | GPT-5.1 | Mid | $1.25 | ✅ | Compare vs base GPT-5 |
| 16 | Claude Sonnet 4 | Premium | $3.00 | ✅ | Compare vs 4.5 |
| 17 | Mistral Small 3.1 24B (free) | Free | Free | ❌ | Best free baseline |
| 18 | Gemma 3 27B (free) | Free | Free | ❌ | Test known-weak model as floor |
| 19 | Grok 4 | Premium | $3.00 | ❌ | xAI comparison point |
| 20 | GPT-4.1 Mini | Budget | $0.40 | ✅ | Proven mid-range with PDF |

**Nice-to-have (4 models — for completeness):**
| # | Model | Tier | Input $/1M | PDF | Rationale |
|---|-------|------|-----------|-----|-----------|
| 21 | GPT-5 Pro | Ultra | $15.00 | ✅ | Ultra ceiling test |
| 22 | Claude Opus 4 | Ultra | $15.00 | ✅ | Ultra ceiling test |
| 23 | Qwen3 VL 8B Instruct | Budget | $0.08 | ❌ | Tiny model stress test |
| 24 | NVIDIA Nemotron Nano 12B (free) | Free | Free | ❌ | Free dark horse |

---

## PDF Input Support Summary

Models with native PDF/file input (important for document extraction without pre-processing):

| Model | Provider | Tier | Input $/1M |
|-------|----------|------|-----------|
| GPT-5 Nano | OpenAI | Budget | $0.05 |
| GPT-4.1 Nano | OpenAI | Budget | $0.10 |
| Gemini 2.0 Flash | Google | Budget | $0.10 |
| GPT-5 Mini | OpenAI | Budget | $0.25 |
| Gemini 2.5 Flash | Google | Budget | $0.30 |
| GPT-4.1 Mini | OpenAI | Budget | $0.40 |
| Gemini 3 Flash Preview | Google | Mid | $0.50 |
| GPT-5 / GPT-5.1 | OpenAI | Mid | $1.25 |
| Gemini 2.5 Pro | Google | Mid | $1.25 |
| Gemini 3 Pro Preview | Google | Mid | $2.00 |
| Claude Sonnet 4.5 / 4 | Anthropic | Premium | $3.00 |
| GPT-5 Pro | OpenAI | Ultra | $15.00 |
| Claude Opus 4 | Anthropic | Ultra | $15.00 |

> 13 of our 24 selected models support PDF input natively.

---

## Key Caveats & Gotchas

1. **Gemma 3 is a trap** — Despite Gemini-derived architecture, it scores only 42.9% on OCR benchmarks. Test it to confirm, but don't expect competitive results.

2. **Claude Sonnet 4 "isn't great for document understanding"** — Reddit reports (May 2025) suggest it underperforms expectations. Sonnet 4.5 reportedly fixes this, but verify.

3. **Gemini Flash > Gemini Pro for OCR** — Counterintuitively, Flash models may be more accurate for pure OCR. Pro models' stronger reasoning can cause hallucinations ("over-thinking" simple text).

4. **GPT-5.2 exists but is expensive** — At $1.75 input, it's only marginally better than GPT-5.1 at $1.25. Not worth a separate test slot unless budget allows.

5. **Qwen models lack PDF support** — Despite being excellent at OCR from images, none of the Qwen VL models support PDF input natively. You'll need to convert PDFs to images first.

6. **Open-source models via OpenRouter** — Performance may vary slightly from self-hosted due to quantization differences on OpenRouter's inference providers.

7. **Mistral OCR ≠ Mistral Small/Medium** — Mistral's dedicated OCR API is excellent but is a different product from their general VLMs on OpenRouter. The general VLMs (Small 3.1, Medium 3) are decent but not OCR-specialized.

8. **Context window matters for multi-page** — Gemini (1M tokens) and GPT-5 (400K) can handle very long documents. Qwen models have shorter contexts (16K-32K for some variants).

---

## Dark Horses to Watch 🏇

| Model | Why It's Interesting |
|-------|---------------------|
| **Llama 4 Maverick** ($0.15) | Overtook Qwen as top open-source OCR. Huge value at this price. |
| **Gemini 2.0 Flash** ($0.10) | Community reports 98-99% accuracy. May outperform models 10-20x its price. |
| **Qwen3 VL 235B A22B** ($0.20) | MoE keeps cost absurdly low for a 235B model. Qwen3 family claims 97% DocVQA. |
| **GPT-5 Nano** ($0.05) | If it inherits GPT-5's vision strength, it could be the ultimate budget pick. |
| **NVIDIA Nemotron Nano 12B** (Free) | Untested dark horse. NVIDIA's VLM entry — could surprise. |
