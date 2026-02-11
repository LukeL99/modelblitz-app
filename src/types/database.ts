/**
 * TypeScript types matching the Supabase database schema.
 * These are manually maintained until we set up `supabase gen types`.
 */

export type DraftStatus =
  | "draft"
  | "ready"
  | "paid"
  | "running"
  | "complete"
  | "failed";

export type ReportStatus =
  | "pending_payment"
  | "paid"
  | "running"
  | "complete"
  | "failed";

export interface BenchmarkDraft {
  id: string;
  user_id: string;
  status: DraftStatus;
  config_data: Record<string, unknown>;
  upload_data: Record<string, unknown>;
  schema_data: Record<string, unknown>;
  selected_models: string[];
  estimated_cost: number | null;
  estimated_runs: number | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  draft_id: string | null;
  status: ReportStatus;
  share_token: string | null;
  stripe_session_id: string | null;
  config_snapshot: Record<string, unknown>;
  image_paths: string[];
  extraction_prompt: string;
  json_schema: Record<string, unknown>;
  recommended_model: string | null;
  total_api_cost: number | null;
  model_count: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export type BenchmarkRunStatus =
  | "pending"
  | "running"
  | "complete"
  | "failed"
  | "skipped";

export interface BenchmarkRun {
  id: string;
  report_id: string;
  model_id: string;
  image_index: number;
  run_number: number;
  output_json: Record<string, unknown> | null;
  is_valid_json: boolean;
  exact_match: boolean;
  field_accuracy: number | null;
  field_errors: Record<string, unknown>[];
  response_time_ms: number | null;
  input_tokens: number | null;
  output_tokens: number | null;
  actual_cost: number | null;
  estimated_cost: number | null;
  status: BenchmarkRunStatus;
  error_message: string | null;
  created_at: string;
}

/**
 * Supabase Database type structure for typed queries.
 * Usage: createClient<Database>() for fully typed Supabase calls.
 */
export interface Database {
  public: {
    Tables: {
      benchmark_drafts: {
        Row: BenchmarkDraft;
        Insert: Omit<BenchmarkDraft, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Omit<BenchmarkDraft, "id" | "user_id" | "created_at">
        > & {
          updated_at?: string;
        };
      };
      reports: {
        Row: Report;
        Insert: Omit<Report, "id" | "created_at" | "share_token"> & {
          id?: string;
          created_at?: string;
          share_token?: string;
        };
        Update: Partial<Omit<Report, "id" | "user_id" | "created_at">>;
      };
      benchmark_runs: {
        Row: BenchmarkRun;
        Insert: Omit<BenchmarkRun, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<BenchmarkRun, "id" | "report_id" | "created_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
