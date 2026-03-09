
-- Helper function: check resource ownership
CREATE OR REPLACE FUNCTION public.user_owns_resource(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _user_id = auth.uid()
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  company TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (public.user_owns_resource(id));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (public.user_owns_resource(id));
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (public.user_owns_resource(id));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Mentions table
CREATE TABLE public.mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '',
  avatar TEXT DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  sentiment TEXT NOT NULL DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  engagement INTEGER DEFAULT 0,
  mention_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own mentions" ON public.mentions FOR SELECT USING (public.user_owns_resource(user_id));
CREATE POLICY "Users insert own mentions" ON public.mentions FOR INSERT WITH CHECK (public.user_owns_resource(user_id));
CREATE POLICY "Users update own mentions" ON public.mentions FOR UPDATE USING (public.user_owns_resource(user_id));
CREATE POLICY "Users delete own mentions" ON public.mentions FOR DELETE USING (public.user_owns_resource(user_id));

CREATE INDEX idx_mentions_user ON public.mentions(user_id);
CREATE INDEX idx_mentions_date ON public.mentions(mention_date DESC);

-- Alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('critical', 'warning', 'info')),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own alerts" ON public.alerts FOR SELECT USING (public.user_owns_resource(user_id));
CREATE POLICY "Users insert own alerts" ON public.alerts FOR INSERT WITH CHECK (public.user_owns_resource(user_id));
CREATE POLICY "Users update own alerts" ON public.alerts FOR UPDATE USING (public.user_owns_resource(user_id));
CREATE POLICY "Users delete own alerts" ON public.alerts FOR DELETE USING (public.user_owns_resource(user_id));

CREATE INDEX idx_alerts_user ON public.alerts(user_id);

-- Monitoring settings table
CREATE TABLE public.monitoring_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  brand TEXT NOT NULL DEFAULT '',
  platforms JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.monitoring_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own settings" ON public.monitoring_settings FOR SELECT USING (public.user_owns_resource(user_id));
CREATE POLICY "Users insert own settings" ON public.monitoring_settings FOR INSERT WITH CHECK (public.user_owns_resource(user_id));
CREATE POLICY "Users update own settings" ON public.monitoring_settings FOR UPDATE USING (public.user_owns_resource(user_id));

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own subscription" ON public.subscriptions FOR SELECT USING (public.user_owns_resource(user_id));
CREATE POLICY "Users insert own subscription" ON public.subscriptions FOR INSERT WITH CHECK (public.user_owns_resource(user_id));
CREATE POLICY "Users update own subscription" ON public.subscriptions FOR UPDATE USING (public.user_owns_resource(user_id));

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_monitoring_updated_at BEFORE UPDATE ON public.monitoring_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
