
-- Lot 1: enrichissement IA des mentions
ALTER TABLE public.mentions
  ADD COLUMN IF NOT EXISTS emotion TEXT,
  ADD COLUMN IF NOT EXISTS is_sarcastic BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS entities JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS theme TEXT,
  ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS mentions_theme_idx ON public.mentions(theme);
CREATE INDEX IF NOT EXISTS mentions_emotion_idx ON public.mentions(emotion);
CREATE INDEX IF NOT EXISTS mentions_enriched_at_idx ON public.mentions(enriched_at);

-- Lot 2: baseline pour détection d'anomalies
CREATE TABLE IF NOT EXISTS public.anomaly_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  window_start TIMESTAMPTZ NOT NULL,
  negative_count INT NOT NULL DEFAULT 0,
  total_count INT NOT NULL DEFAULT 0,
  risk_score INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.anomaly_baselines TO authenticated;
GRANT ALL ON public.anomaly_baselines TO service_role;

ALTER TABLE public.anomaly_baselines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own baselines"
  ON public.anomaly_baselines FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS anomaly_baselines_user_window_idx
  ON public.anomaly_baselines(user_id, window_start DESC);
