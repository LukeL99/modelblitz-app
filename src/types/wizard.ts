/**
 * Type definitions for the benchmark configuration wizard.
 */

/** User-rankable priority dimensions */
export type Priority = "accuracy" | "speed" | "cost";

/** Pre-built strategy presets that control model selection and run allocation */
export type Strategy = "quick-survey" | "deep-dive" | "balanced";

/** The three wizard steps */
export type WizardStep = "config" | "upload" | "schema";

/** Schema source: auto-inferred or manually provided */
export type SchemaSource = "auto" | "manual";

/** A single uploaded image with its expected JSON output */
export interface ImageEntry {
  /** Unique ID for this image entry */
  id: string;
  /** Storage path in Supabase Storage */
  path: string;
  /** Public URL for thumbnail preview */
  publicUrl: string;
  /** Original filename */
  filename: string;
  /** File size in bytes */
  fileSize: number;
  /** Expected JSON output (raw string for editor) */
  expectedJson: string;
  /** Whether the expectedJson parses as valid JSON */
  jsonValid: boolean;
  /** Parsed JSON object (null if invalid) */
  parsedJson: unknown | null;
}

/** Schema configuration from Step 3 */
export interface SchemaConfig {
  /** Auto-inferred JSON schema from examples */
  inferredSchema: Record<string, unknown> | null;
  /** User-provided/edited schema (overrides inferred) */
  userSchema: Record<string, unknown> | null;
  /** Extraction prompt for the vision models */
  prompt: string;
  /** Whether schema was auto-inferred or manually provided */
  schemaSource: SchemaSource;
}

/** Complete wizard configuration (persisted to benchmark_drafts) */
export interface WizardConfig {
  /** Ranked priorities -- index 0 is highest priority */
  priorities: Priority[];
  /** Selected strategy preset */
  strategy: Strategy;
  /** Number of samples/runs per model */
  sampleCount: number;
  /** Uploaded images with expected JSON */
  images: ImageEntry[];
  /** Schema configuration */
  schema: SchemaConfig;
  /** Selected model IDs (OpenRouter model IDs) */
  selectedModels: string[];
}

/** Strategy preset metadata for display */
export interface StrategyPreset {
  id: Strategy;
  name: string;
  description: string;
  modelCount: "many" | "moderate" | "few";
  runsPerModel: "few" | "moderate" | "many";
}

/** Available strategy presets */
export const STRATEGY_PRESETS: StrategyPreset[] = [
  {
    id: "quick-survey",
    name: "Quick Survey",
    description:
      "Test many models with fewer runs each. Great for narrowing down candidates.",
    modelCount: "many",
    runsPerModel: "few",
  },
  {
    id: "balanced",
    name: "Balanced",
    description:
      "Moderate number of models with solid statistical confidence.",
    modelCount: "moderate",
    runsPerModel: "moderate",
  },
  {
    id: "deep-dive",
    name: "Deep Dive",
    description:
      "Fewer models but more runs each. Best for final selection with high confidence.",
    modelCount: "few",
    runsPerModel: "many",
  },
];
