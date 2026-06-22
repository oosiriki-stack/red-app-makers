
ALTER TABLE public.mentions ADD COLUMN IF NOT EXISTS impact_score integer DEFAULT 0;
ALTER TABLE public.monitoring_settings ADD COLUMN IF NOT EXISTS paused_at timestamptz;
ALTER TABLE public.monitoring_settings ADD COLUMN IF NOT EXISTS previous_brand text;

-- Auto-pause previous surveillance: when brand changes, mark previous_brand and set paused_at, then reset cutoff
CREATE OR REPLACE FUNCTION public.handle_surveillance_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.brand IS DISTINCT FROM NEW.brand AND OLD.brand IS NOT NULL AND length(trim(OLD.brand)) > 0 THEN
    NEW.previous_brand := OLD.brand;
    NEW.paused_at := now();
    NEW.monitoring_started_at := now();
    INSERT INTO public.alerts (user_id, type, title, description, query)
    VALUES (NEW.user_id, 'info', 'Surveillance mise à jour',
      'Surveillance précédente « ' || OLD.brand || ' » archivée. Nouvelle surveillance active : « ' || NEW.brand || ' ».',
      NEW.brand);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_surveillance_change ON public.monitoring_settings;
CREATE TRIGGER trg_surveillance_change BEFORE UPDATE ON public.monitoring_settings
FOR EACH ROW EXECUTE FUNCTION public.handle_surveillance_change();
