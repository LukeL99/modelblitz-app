-- ModelPick Phase 2: Benchmark runs table and reports extension
-- Creates benchmark_runs for per-run results, adds stripe_session_id to reports

-- Benchmark runs (individual model execution results)
CREATE TABLE benchmark_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  image_index INT NOT NULL,
  run_number INT NOT NULL,

  -- Results
  output_json JSONB,
  is_valid_json BOOLEAN DEFAULT false,
  exact_match BOOLEAN DEFAULT false,
  field_accuracy NUMERIC(5,2),
  field_errors JSONB DEFAULT '[]',

  -- Performance metrics
  response_time_ms INT,
  input_tokens INT,
  output_tokens INT,
  actual_cost NUMERIC(10,6),
  estimated_cost NUMERIC(10,6),

  -- Status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'complete', 'failed', 'skipped')),
  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for benchmark_runs
CREATE INDEX idx_benchmark_runs_report ON benchmark_runs(report_id);
CREATE INDEX idx_benchmark_runs_report_model ON benchmark_runs(report_id, model_id);
CREATE INDEX idx_benchmark_runs_status ON benchmark_runs(status);

-- RLS for benchmark_runs
ALTER TABLE benchmark_runs ENABLE ROW LEVEL SECURITY;

-- Authenticated users can SELECT runs where report belongs to them
CREATE POLICY "Users can view runs for own reports"
  ON benchmark_runs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reports
      WHERE reports.id = benchmark_runs.report_id
        AND reports.user_id = (SELECT auth.uid())
    )
  );

-- Add stripe_session_id to reports table
ALTER TABLE reports ADD COLUMN stripe_session_id TEXT UNIQUE;

-- Add UPDATE policy on reports for authenticated users (needed for status updates)
CREATE POLICY "Users can update own reports"
  ON reports FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);
