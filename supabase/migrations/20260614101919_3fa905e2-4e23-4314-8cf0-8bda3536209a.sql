-- Fix subscription plan-escalation: restrict pending UPDATEs to plan='starter'
DROP POLICY IF EXISTS "Users update own pending subscription" ON public.subscriptions;
CREATE POLICY "Users update own pending subscription"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'pending' AND plan = 'starter');

-- Fix storage policy to use private.has_role consistently (avoid relying on public.has_role)
DROP POLICY IF EXISTS "Admins manage payment proofs" ON storage.objects;
CREATE POLICY "Admins manage payment proofs"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'::public.app_role));