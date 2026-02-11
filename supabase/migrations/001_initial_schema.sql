-- ModelPick Phase 1 Database Schema
-- Creates benchmark_drafts and reports tables with RLS

-- Benchmark drafts (wizard state)
CREATE TABLE benchmark_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'ready', 'paid', 'running', 'complete', 'failed')),

  -- Step 1: Configuration
  config_data JSONB DEFAULT '{}',
  -- Expected shape: { priorities: ["accuracy","speed","cost"], strategy: "balanced", sampleCount: 3 }

  -- Step 2: Upload
  upload_data JSONB DEFAULT '{}',
  -- Expected shape: { images: [{ path, publicUrl, expectedJson, jsonValid }] }

  -- Step 3: Schema & Prompt
  schema_data JSONB DEFAULT '{}',
  -- Expected shape: { inferredSchema, userSchema, prompt, schemaSource: "auto"|"manual" }

  -- Model configuration (computed from config, user can override)
  selected_models TEXT[] DEFAULT '{}',
  estimated_cost NUMERIC(10,4),
  estimated_runs INT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reports (created from draft after payment, used for dashboard)
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  draft_id UUID REFERENCES benchmark_drafts(id),
  status TEXT NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('pending_payment', 'paid', 'running', 'complete', 'failed')),
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),

  -- Snapshot of config at time of payment
  config_snapshot JSONB NOT NULL,
  image_paths TEXT[] NOT NULL,
  extraction_prompt TEXT NOT NULL,
  json_schema JSONB NOT NULL,

  -- Results (populated after benchmark)
  recommended_model TEXT,
  total_api_cost NUMERIC(10,4),
  model_count INT,

  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_benchmark_drafts_user ON benchmark_drafts(user_id);
CREATE INDEX idx_benchmark_drafts_status ON benchmark_drafts(status) WHERE status = 'draft';
CREATE INDEX idx_reports_user ON reports(user_id);
CREATE INDEX idx_reports_share_token ON reports(share_token);
CREATE INDEX idx_reports_created ON reports(created_at DESC);

-- RLS Policies
ALTER TABLE benchmark_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Drafts: owner can CRUD
CREATE POLICY "Users can view own drafts"
  ON benchmark_drafts FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own drafts"
  ON benchmark_drafts FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own drafts"
  ON benchmark_drafts FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own drafts"
  ON benchmark_drafts FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Reports: owner can read, public can read via share_token
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Anyone can view shared reports"
  ON reports FOR SELECT
  TO anon, authenticated
  USING (share_token IS NOT NULL);

CREATE POLICY "Users can insert own reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);
