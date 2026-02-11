import type { ModelInfo, ModelProvider, ModelTier } from "@/types/benchmark";

/**
 * Curated vision model lineup for OCR/structured data extraction benchmarking.
 * Prices sourced from OpenRouter API as of 2026-02-11.
 *
 * Selection based on:
 * - Fraunhofer IAIS Invoice Benchmark (2025)
 * - Omni OCR Benchmark
 * - OmniDocBench 1.5 (Nov 2025)
 * - Community reports and internal testing
 */
export const CURATED_MODELS: ModelInfo[] = [
  // --- Free Tier ---
  {
    id: "mistralai/mistral-small-3.1-24b-instruct:free",
    name: "Mistral Small 3.1 24B",
    provider: "mistralai",
    tier: "free",
    inputCostPer1M: 0,
    outputCostPer1M: 0,
    contextWindow: 128_000,
    supportsVision: true,
    supportsPdf: false,
  },
  {
    id: "google/gemma-3-27b-it:free",
    name: "Gemma 3 27B",
    provider: "google",
    tier: "free",
    inputCostPer1M: 0,
    outputCostPer1M: 0,
    contextWindow: 131_072,
    supportsVision: true,
    supportsPdf: false,
  },
  {
    id: "nvidia/nemotron-nano-12b-2-vl-instruct:free",
    name: "NVIDIA Nemotron Nano 12B 2 VL",
    provider: "nvidia",
    tier: "free",
    inputCostPer1M: 0,
    outputCostPer1M: 0,
    contextWindow: 128_000,
    supportsVision: true,
    supportsPdf: false,
  },
  {
    id: "google/gemma-3-12b-it:free",
    name: "Gemma 3 12B",
    provider: "google",
    tier: "free",
    inputCostPer1M: 0,
    outputCostPer1M: 0,
    contextWindow: 32_768,
    supportsVision: true,
    supportsPdf: false,
  },

  // --- Budget Tier (under $0.50/1M input) ---
  {
    id: "openai/gpt-5-nano",
    name: "GPT-5 Nano",
    provider: "openai",
    tier: "budget",
    inputCostPer1M: 0.05,
    outputCostPer1M: 0.4,
    contextWindow: 400_000,
    supportsVision: true,
    supportsPdf: true,
  },
  {
    id: "google/gemini-2.0-flash-001",
    name: "Gemini 2.0 Flash",
    provider: "google",
    tier: "budget",
    inputCostPer1M: 0.1,
    outputCostPer1M: 0.4,
    contextWindow: 1_048_576,
    supportsVision: true,
    supportsPdf: true,
  },
  {
    id: "openai/gpt-4.1-nano",
    name: "GPT-4.1 Nano",
    provider: "openai",
    tier: "budget",
    inputCostPer1M: 0.1,
    outputCostPer1M: 0.4,
    contextWindow: 1_047_576,
    supportsVision: true,
    supportsPdf: true,
  },
  {
    id: "qwen/qwen2.5-vl-72b-instruct",
    name: "Qwen 2.5 VL 72B Instruct",
    provider: "qwen",
    tier: "budget",
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.6,
    contextWindow: 32_768,
    supportsVision: true,
    supportsPdf: false,
  },
  {
    id: "meta-llama/llama-4-maverick",
    name: "Llama 4 Maverick",
    provider: "meta-llama",
    tier: "budget",
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.6,
    contextWindow: 1_048_576,
    supportsVision: true,
    supportsPdf: false,
  },
  {
    id: "qwen/qwen3-vl-235b-a22b-instruct",
    name: "Qwen3 VL 235B A22B Instruct",
    provider: "qwen",
    tier: "budget",
    inputCostPer1M: 0.2,
    outputCostPer1M: 0.88,
    contextWindow: 262_144,
    supportsVision: true,
    supportsPdf: false,
  },
  {
    id: "openai/gpt-5-mini",
    name: "GPT-5 Mini",
    provider: "openai",
    tier: "budget",
    inputCostPer1M: 0.25,
    outputCostPer1M: 2.0,
    contextWindow: 400_000,
    supportsVision: true,
    supportsPdf: true,
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "google",
    tier: "budget",
    inputCostPer1M: 0.3,
    outputCostPer1M: 2.5,
    contextWindow: 1_048_576,
    supportsVision: true,
    supportsPdf: true,
  },
  {
    id: "openai/gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "openai",
    tier: "budget",
    inputCostPer1M: 0.4,
    outputCostPer1M: 1.6,
    contextWindow: 1_047_576,
    supportsVision: true,
    supportsPdf: true,
  },

  // --- Mid Tier ($0.50 - $2.99/1M input) ---
  {
    id: "google/gemini-3-flash-preview",
    name: "Gemini 3 Flash Preview",
    provider: "google",
    tier: "mid",
    inputCostPer1M: 0.5,
    outputCostPer1M: 3.0,
    contextWindow: 1_048_576,
    supportsVision: true,
    supportsPdf: true,
  },
  {
    id: "anthropic/claude-haiku-4.5",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    tier: "mid",
    inputCostPer1M: 1.0,
    outputCostPer1M: 5.0,
    contextWindow: 200_000,
    supportsVision: true,
    supportsPdf: false,
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "google",
    tier: "mid",
    inputCostPer1M: 1.25,
    outputCostPer1M: 10.0,
    contextWindow: 1_048_576,
    supportsVision: true,
    supportsPdf: true,
  },
  {
    id: "openai/gpt-5",
    name: "GPT-5",
    provider: "openai",
    tier: "mid",
    inputCostPer1M: 1.25,
    outputCostPer1M: 10.0,
    contextWindow: 400_000,
    supportsVision: true,
    supportsPdf: true,
  },
  {
    id: "openai/gpt-5.1",
    name: "GPT-5.1",
    provider: "openai",
    tier: "mid",
    inputCostPer1M: 1.25,
    outputCostPer1M: 10.0,
    contextWindow: 400_000,
    supportsVision: true,
    supportsPdf: true,
  },
  {
    id: "google/gemini-3-pro-preview",
    name: "Gemini 3 Pro Preview",
    provider: "google",
    tier: "mid",
    inputCostPer1M: 2.0,
    outputCostPer1M: 12.0,
    contextWindow: 1_048_576,
    supportsVision: true,
    supportsPdf: true,
  },

  // --- Premium Tier ($3.00 - $9.99/1M input) ---
  {
    id: "anthropic/claude-sonnet-4.5",
    name: "Claude Sonnet 4.5",
    provider: "anthropic",
    tier: "premium",
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    contextWindow: 1_000_000,
    supportsVision: true,
    supportsPdf: true,
  },
  {
    id: "anthropic/claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "anthropic",
    tier: "premium",
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    contextWindow: 1_000_000,
    supportsVision: true,
    supportsPdf: true,
  },
  {
    id: "x-ai/grok-4",
    name: "Grok 4",
    provider: "x-ai",
    tier: "premium",
    inputCostPer1M: 3.0,
    outputCostPer1M: 15.0,
    contextWindow: 256_000,
    supportsVision: true,
    supportsPdf: false,
  },
  {
    id: "anthropic/claude-opus-4.6",
    name: "Claude Opus 4.6",
    provider: "anthropic",
    tier: "premium",
    inputCostPer1M: 5.0,
    outputCostPer1M: 25.0,
    contextWindow: 1_000_000,
    supportsVision: true,
    supportsPdf: false,
  },

  // --- Ultra Tier ($10+/1M input) ---
  {
    id: "openai/gpt-5-pro",
    name: "GPT-5 Pro",
    provider: "openai",
    tier: "ultra",
    inputCostPer1M: 15.0,
    outputCostPer1M: 120.0,
    contextWindow: 400_000,
    supportsVision: true,
    supportsPdf: true,
  },
  {
    id: "anthropic/claude-opus-4",
    name: "Claude Opus 4",
    provider: "anthropic",
    tier: "ultra",
    inputCostPer1M: 15.0,
    outputCostPer1M: 75.0,
    contextWindow: 200_000,
    supportsVision: true,
    supportsPdf: true,
  },
] as const;

/** Color mapping for model providers (Tailwind class names) */
export const PROVIDER_COLORS: Record<ModelProvider, string> = {
  openai: "text-green-400",
  anthropic: "text-orange-400",
  google: "text-blue-400",
  "meta-llama": "text-indigo-400",
  qwen: "text-purple-400",
  mistralai: "text-cyan-400",
  "x-ai": "text-red-400",
  nvidia: "text-lime-400",
};

/** Background color mapping for model providers */
export const PROVIDER_BG_COLORS: Record<ModelProvider, string> = {
  openai: "bg-green-400/10",
  anthropic: "bg-orange-400/10",
  google: "bg-blue-400/10",
  "meta-llama": "bg-indigo-400/10",
  qwen: "bg-purple-400/10",
  mistralai: "bg-cyan-400/10",
  "x-ai": "bg-red-400/10",
  nvidia: "bg-lime-400/10",
};

/** Color mapping for pricing tiers */
export const TIER_COLORS: Record<ModelTier, string> = {
  free: "text-emerald-400",
  budget: "text-sky-400",
  mid: "text-amber-400",
  premium: "text-rose-400",
  ultra: "text-fuchsia-400",
};

/** Get models filtered by tier */
export function getModelsByTier(tier: ModelTier): ModelInfo[] {
  return CURATED_MODELS.filter((m) => m.tier === tier);
}

/** Get a model by its OpenRouter ID */
export function getModelById(id: string): ModelInfo | undefined {
  return CURATED_MODELS.find((m) => m.id === id);
}

/** Get unique providers from curated list */
export function getProviders(): ModelProvider[] {
  return [...new Set(CURATED_MODELS.map((m) => m.provider))];
}
