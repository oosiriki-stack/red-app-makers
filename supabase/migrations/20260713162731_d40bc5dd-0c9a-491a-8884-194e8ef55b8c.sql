CREATE OR REPLACE FUNCTION public.sector_benchmarks(_sector text)
RETURNS TABLE(total bigint, positive_pct numeric, negative_pct numeric, neutral_pct numeric, avg_per_user numeric, user_count bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uc bigint;
BEGIN
  SELECT count(DISTINCT user_id) INTO uc
  FROM public.monitoring_settings
  WHERE sector = _sector;

  IF uc < 3 THEN
    RETURN QUERY SELECT 0::bigint, 0::numeric, 0::numeric, 0::numeric, 0::numeric, uc;
    RETURN;
  END IF;

  RETURN QUERY
  WITH sector_users AS (
    SELECT DISTINCT user_id FROM public.monitoring_settings WHERE sector = _sector
  ),
  m AS (
    SELECT sentiment
    FROM public.mentions
    WHERE user_id IN (SELECT user_id FROM sector_users)
      AND mention_date >= now() - interval '30 days'
  )
  SELECT
    count(*)::bigint,
    ROUND(100.0 * count(*) FILTER (WHERE sentiment='positive') / NULLIF(count(*),0), 1),
    ROUND(100.0 * count(*) FILTER (WHERE sentiment='negative') / NULLIF(count(*),0), 1),
    ROUND(100.0 * count(*) FILTER (WHERE sentiment='neutral')  / NULLIF(count(*),0), 1),
    ROUND(count(*)::numeric / NULLIF(uc,0), 1),
    uc
  FROM m;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sector_benchmarks(text) TO authenticated;