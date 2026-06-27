
-- 1) Add sector to monitoring_settings
ALTER TABLE public.monitoring_settings ADD COLUMN IF NOT EXISTS sector text;

-- 2) Drop city/commune columns (no longer used)
ALTER TABLE public.monitoring_settings DROP COLUMN IF EXISTS city;
ALTER TABLE public.monitoring_settings DROP COLUMN IF EXISTS commune;

-- 3) SECURITY: Fix storage policy that still uses public.has_role, then drop the public function
DROP POLICY IF EXISTS "Admins manage payment proofs" ON storage.objects;
CREATE POLICY "Admins manage payment proofs" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'payment-proofs' AND (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'super_admin'::app_role)))
  WITH CHECK (bucket_id = 'payment-proofs' AND (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'super_admin'::app_role)));

DROP FUNCTION IF EXISTS public.has_role(uuid, app_role) CASCADE;

-- 4) SECURITY: Allow invitees to read their own pending invitations by email
DROP POLICY IF EXISTS "Invitees read own invitations" ON public.workspace_invitations;
CREATE POLICY "Invitees read own invitations" ON public.workspace_invitations
  FOR SELECT TO authenticated
  USING (lower(email) = lower((SELECT email FROM auth.users WHERE id = auth.uid())));

-- 5) SECURITY: Restrict anomaly_baselines writes to service role only (explicit revoke + note)
REVOKE INSERT, UPDATE, DELETE ON public.anomaly_baselines FROM authenticated, anon;

-- 6) NOTIFICATION: alert users without a country
INSERT INTO public.alerts (user_id, type, title, description)
SELECT ms.user_id, 'info',
       '🌍 Renseignez votre pays',
       'Pour des résultats de veille plus pertinents, renseignez votre pays dans Paramètres → Surveillance.'
FROM public.monitoring_settings ms
WHERE coalesce(trim(ms.country), '') = '';
