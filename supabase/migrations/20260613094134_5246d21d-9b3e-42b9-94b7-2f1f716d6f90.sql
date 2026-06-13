CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT USAGE ON SCHEMA private TO service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO service_role;

DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'super_admin'::public.app_role) OR private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins insert subscriptions" ON public.subscriptions;
CREATE POLICY "Admins insert subscriptions"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (private.has_role(auth.uid(), 'super_admin'::public.app_role) OR private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins update all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins update all subscriptions"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'super_admin'::public.app_role) OR private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins view all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins view all subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'super_admin'::public.app_role) OR private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins delete tickets" ON public.support_tickets;
CREATE POLICY "Admins delete tickets"
ON public.support_tickets
FOR DELETE
TO authenticated
USING (private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Users update own tickets, admins all" ON public.support_tickets;
CREATE POLICY "Users update own tickets, admins all"
ON public.support_tickets
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'super_admin'::public.app_role) OR private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Users view own tickets" ON public.support_tickets;
CREATE POLICY "Users view own tickets"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'super_admin'::public.app_role) OR private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins view all roles" ON public.user_roles;
CREATE POLICY "Admins view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP POLICY IF EXISTS "Super admin manages roles" ON public.user_roles;
CREATE POLICY "Super admin manages roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'super_admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'super_admin'::public.app_role));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;