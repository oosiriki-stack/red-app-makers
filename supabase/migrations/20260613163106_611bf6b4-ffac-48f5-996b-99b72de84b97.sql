
-- Security definer helper to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 1) Restrict self-service plan selection to 'starter'
DROP POLICY IF EXISTS "Users submit own pending subscription" ON public.subscriptions;
CREATE POLICY "Users submit own pending subscription"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND status = 'pending'
  AND plan = 'starter'
);

-- 2) Storage policies for payment-proofs
DROP POLICY IF EXISTS "Users update own payment proofs" ON storage.objects;
CREATE POLICY "Users update own payment proofs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users delete own payment proofs" ON storage.objects;
CREATE POLICY "Users delete own payment proofs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Admins manage payment proofs" ON storage.objects;
CREATE POLICY "Admins manage payment proofs"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
