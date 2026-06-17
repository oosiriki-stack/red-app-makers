
DROP POLICY IF EXISTS "Users manage own rss feeds" ON public.rss_feeds;
CREATE POLICY "Users manage own rss feeds" ON public.rss_feeds
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read own social handles" ON public.social_handles;
CREATE POLICY "Users read own social handles" ON public.social_handles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'super_admin'::public.app_role));
