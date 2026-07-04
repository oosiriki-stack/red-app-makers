
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  target TEXT,
  status TEXT NOT NULL DEFAULT 'success',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.admin_activity_log TO authenticated;
GRANT ALL ON public.admin_activity_log TO service_role;

ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own activity"
ON public.admin_activity_log
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Super admins can read all activity"
ON public.admin_activity_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'super_admin'::public.app_role
  )
);

CREATE INDEX IF NOT EXISTS admin_activity_log_created_idx ON public.admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS admin_activity_log_action_idx ON public.admin_activity_log(action);
