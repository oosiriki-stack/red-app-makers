
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_status_check
  CHECK (status = ANY (ARRAY['pending','active','inactive','cancelled','expired']));

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS payer_name TEXT,
  ADD COLUMN IF NOT EXISTS payer_phone TEXT,
  ADD COLUMN IF NOT EXISTS card_last4 TEXT,
  ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS validated_by UUID,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS amount_fcfa INTEGER;

DROP POLICY IF EXISTS "Users submit own pending subscription" ON public.subscriptions;
CREATE POLICY "Users submit own pending subscription" ON public.subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

DROP POLICY IF EXISTS "Users update own pending subscription" ON public.subscriptions;
CREATE POLICY "Users update own pending subscription" ON public.subscriptions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT;

ALTER TABLE public.mentions
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS interactions JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.alerts
  ADD COLUMN IF NOT EXISTS reaction TEXT,
  ADD COLUMN IF NOT EXISTS reaction_note TEXT;

DROP POLICY IF EXISTS "Users upload own payment proofs" ON storage.objects;
CREATE POLICY "Users upload own payment proofs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users read own payment proofs" ON storage.objects;
CREATE POLICY "Users read own payment proofs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Admins read all payment proofs" ON storage.objects;
CREATE POLICY "Admins read all payment proofs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs' AND (private.has_role(auth.uid(), 'super_admin'::app_role) OR private.has_role(auth.uid(), 'admin'::app_role)));

CREATE OR REPLACE FUNCTION public.handle_subscription_validation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'active' AND (OLD.status IS DISTINCT FROM 'active') THEN
    NEW.validated_at := COALESCE(NEW.validated_at, now());
    NEW.expires_at := COALESCE(NEW.expires_at, now() + interval '30 days');
    INSERT INTO public.alerts (user_id, type, title, description)
    VALUES (NEW.user_id, 'info', '✅ Licence activée',
      'Votre abonnement ' || NEW.plan || ' est actif jusqu''au ' || to_char(NEW.expires_at, 'DD/MM/YYYY'));
  ELSIF NEW.status = 'pending' AND (OLD.status IS DISTINCT FROM 'pending') THEN
    NEW.submitted_at := COALESCE(NEW.submitted_at, now());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_subscription_validation ON public.subscriptions;
CREATE TRIGGER trg_subscription_validation
  BEFORE INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_subscription_validation();
