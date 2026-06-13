
-- Allow 'trial' plan
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan = ANY (ARRAY['trial','starter','pro','enterprise']));

-- Update handle_new_user to also create a 14-day trial subscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));

  INSERT INTO public.subscriptions (user_id, plan, status, start_date, expires_at, validated_at)
  VALUES (NEW.id, 'trial', 'active', now(), now() + interval '14 days', now())
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- Backfill: give existing users without a subscription a 14-day trial
INSERT INTO public.subscriptions (user_id, plan, status, start_date, expires_at, validated_at)
SELECT u.id, 'trial', 'active', now(), now() + interval '14 days', now()
FROM auth.users u
LEFT JOIN public.subscriptions s ON s.user_id = u.id
WHERE s.id IS NULL
ON CONFLICT (user_id) DO NOTHING;
