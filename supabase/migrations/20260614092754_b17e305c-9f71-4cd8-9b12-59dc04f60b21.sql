ALTER TABLE public.monitoring_settings ADD COLUMN IF NOT EXISTS monitoring_started_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- For existing users: set cutoff to now so only fresh mentions count from this point
UPDATE public.monitoring_settings SET monitoring_started_at = now() WHERE monitoring_started_at IS NULL OR monitoring_started_at < now() - interval '1 minute';

-- Ensure realtime delivers full rows
ALTER TABLE public.mentions REPLICA IDENTITY FULL;
ALTER TABLE public.alerts REPLICA IDENTITY FULL;