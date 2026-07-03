
CREATE TABLE IF NOT EXISTS public.notification_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('sms','whatsapp','slack','teams','email')),
  target TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  verified BOOLEAN NOT NULL DEFAULT false,
  last_test_at TIMESTAMPTZ,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, channel)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_channels TO authenticated;
GRANT ALL ON public.notification_channels TO service_role;
ALTER TABLE public.notification_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own channels select" ON public.notification_channels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own channels insert" ON public.notification_channels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own channels update" ON public.notification_channels FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own channels delete" ON public.notification_channels FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_notification_channels_updated BEFORE UPDATE ON public.notification_channels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
