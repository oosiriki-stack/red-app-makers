
-- 1) ALERTS: rewrite policies, scope to authenticated, drop user_owns_resource use
DROP POLICY IF EXISTS "Users delete own alerts" ON public.alerts;
DROP POLICY IF EXISTS "Users insert own alerts" ON public.alerts;
DROP POLICY IF EXISTS "Users read own alerts" ON public.alerts;
DROP POLICY IF EXISTS "Users update own alerts" ON public.alerts;
CREATE POLICY "Users read own alerts" ON public.alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own alerts" ON public.alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own alerts" ON public.alerts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own alerts" ON public.alerts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 2) MENTIONS
DROP POLICY IF EXISTS "Users delete own mentions" ON public.mentions;
DROP POLICY IF EXISTS "Users insert own mentions" ON public.mentions;
DROP POLICY IF EXISTS "Users read own mentions" ON public.mentions;
DROP POLICY IF EXISTS "Users update own mentions" ON public.mentions;
CREATE POLICY "Users read own mentions" ON public.mentions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own mentions" ON public.mentions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own mentions" ON public.mentions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own mentions" ON public.mentions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 3) MONITORING SETTINGS
DROP POLICY IF EXISTS "Users insert own settings" ON public.monitoring_settings;
DROP POLICY IF EXISTS "Users read own settings" ON public.monitoring_settings;
DROP POLICY IF EXISTS "Users update own settings" ON public.monitoring_settings;
CREATE POLICY "Users read own settings" ON public.monitoring_settings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own settings" ON public.monitoring_settings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own settings" ON public.monitoring_settings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4) PROFILES
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 5) SUBSCRIPTIONS — remove user self-insert/self-update (privilege escalation)
DROP POLICY IF EXISTS "Users insert own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users update own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users read own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins insert subscriptions" ON public.subscriptions;
CREATE POLICY "Users read own subscription" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins insert subscriptions" ON public.subscriptions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role) OR public.has_role(auth.uid(), 'admin'::app_role));

-- 6) Drop unused SECURITY DEFINER helper
DROP FUNCTION IF EXISTS public.user_owns_resource(uuid);

-- 7) Realtime broadcast/presence default deny
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deny realtime broadcast and presence" ON realtime.messages;
CREATE POLICY "Deny realtime broadcast and presence" ON realtime.messages FOR ALL TO authenticated USING (false) WITH CHECK (false);
