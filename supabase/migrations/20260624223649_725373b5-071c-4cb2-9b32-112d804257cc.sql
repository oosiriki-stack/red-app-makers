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
  VALUES (NEW.id, 'trial', 'active', now(), now() + interval '7 days', now())
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$function$;