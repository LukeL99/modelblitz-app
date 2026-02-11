/**
 * Type definitions for benchmark configuration, models, and reports.
 */

/** Tier classification for model pricing */
export type ModelTier = "free" | "budget" | "mid" | "premium" | "ultra";

/** Vision model providers available on OpenRouter */
export type ModelProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "meta-llama"
  | "qwen"
  | "mistralai"
  | "x-ai"
  | "nvidia";

/** Information about a single vision model */
export interface ModelInfo {
  /** OpenRouter model ID (e.g., "google/gemini-2.0-flash") */
  id: string;
  /** Human-readable display name */
  name: string;
  /** Model provider */
  provider: ModelProvider;
  /** Pricing tier */
  tier: ModelTier;
  /** Cost per 1M input tokens in USD */
  inputCostPer1M: number;
  /** Cost per 1M output tokens in USD */
  outputCostPer1M: number;
  /** Context window size in tokens */
  contextWindow: number;
  /** Whether the model supports vision/image input */
  supportsVision: true;
  /** Whether the model supports PDF/file input */
  supportsPdf: boolean;
}

/** Configuration snapshot stored with a report */
export interface BenchmarkConfig {
  /** Ranked priorities */
  priorities: string[];
  /** Strategy preset used */
  strategy: string;
  /** Number of samples per model */
  sampleCount: number;
  /** Models that were benchmarked */
  models: string[];
  /** Extraction prompt used */
  prompt: string;
  /** JSON schema used for validation */
  schema: Record<string, unknown>;
  /** Number of images in the benchmark */
  imageCount: number;
}

/** Results for a single model in a benchmark report */
export interface ModelResult {
  /** OpenRouter model ID */
  modelId: string;
  /** Display name */
  modelName: string;
  /** Provider */
  provider: ModelProvider;
  /** Overall accuracy percentage (0-100) */
  accuracy: number;
  /** Average cost per API call in USD */
  costPerCall: number;
  /** Median response time in ms */
  medianLatency: number;
  /** P95 response time in ms */
  p95Latency: number;
  /** Consistency score (standard deviation of accuracy across runs) */
  spread: number;
  /** Number of runs completed */
  runsCompleted: number;
  /** Number of runs attempted */
  runsAttempted: number;
  /** Per-field error breakdown */
  fieldErrors: FieldError[];
}

/** A field-level error from model extraction */
export interface FieldError {
  /** JSON field path (e.g., "items[0].price") */
  fieldPath: string;
  /** Expected value */
  expected: string;
  /** Value the model returned */
  actual: string;
  /** How many times this error occurred across runs */
  occurrences: number;
}

/** Complete benchmark report */
export interface BenchmarkReport {
  /** Report ID */
  id: string;
  /** Report status */
  status: "pending_payment" | "paid" | "running" | "complete" | "failed";
  /** Share token for public access */
  shareToken: string | null;
  /** Configuration used for this benchmark */
  config: BenchmarkConfig;
  /** Per-model results, sorted by recommended ranking */
  results: ModelResult[];
  /** Top recommended model ID */
  recommendedModel: string | null;
  /** Total API cost for the benchmark run */
  totalApiCost: number | null;
  /** Number of models tested */
  modelCount: number | null;
  /** When the benchmark started */
  startedAt: string | null;
  /** When the benchmark completed */
  completedAt: string | null;
  /** When the report was created */
  createdAt: string;
}
