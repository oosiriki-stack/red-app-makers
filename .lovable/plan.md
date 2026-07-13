## Livraison en parallèle des deux chantiers

### 1. Google Reviews (Apify)

**Edge function `google-reviews-scan`** (nouvelle)
- Actor Apify `compass~google-maps-reviews-scraper` (le plus fiable pour reviews historiques).
- Input : nom de marque + pays (depuis `monitoring_settings`).
- Récupère max 50 avis / run, normalise et insère dans `mentions` :
  - `source = 'google'`, `content = review.text`, `author = review.name`, `sentiment` déduit du `stars` (≥4 positive, =3 neutral, ≤2 negative), `mention_date = review.publishedAtDate`, `url = review.reviewUrl`, `entities.stars`, `entities.place_name`.
- Dédoublonnage par `url` (unique déjà en place ? sinon check `content + author`).
- Réutilise `APIFY_TOKEN` déjà configuré. Config `verify_jwt = true`.

**Front — bouton manuel**
- Dans `Settings.tsx` (onglet surveillance) : bouton « Importer les avis Google » qui invoque `google-reviews-scan` et affiche un toast avec le nombre d'avis importés.
- `Mentions.tsx` filtre `google` déjà géré via `platforms.ts` (source existante).

### 2. Analytics avancé — `/analytics`

**Nouvelle page `src/pages/Analytics.tsx`** protégée par `PlanGate("reports")` (Starter+).
- Route ajoutée dans `App.tsx` (lazy).
- Lien dans `AppSidebar` + `BottomNav` (icône `BarChart3`).

**3 onglets (Tabs shadcn) :**

1. **Cohortes** — matrice heatmap :
   - Cohorte = semaine ISO de la 1re mention par plateforme.
   - Affiche volume de mentions par cohorte / semaine relative (W0..W8).
   - Requête SQL agrégée client-side sur `mentions` de l'utilisateur.

2. **Rétention sentiment** — ligne Recharts :
   - Pour chaque semaine, % de mentions restant `positive` vs `negative` sur les 4 semaines suivantes.
   - Metric = « stabilité positive » et « dégradation ».

3. **Benchmarks sectoriels** — bars comparatives :
   - Utilise `monitoring_settings.sector` de l'utilisateur.
   - Compare mes 30 derniers jours (volume, % positif, % négatif) vs moyennes agrégées de tous les utilisateurs du même secteur (RPC sécurisée `sector_benchmarks(sector text)` retournant uniquement des agrégats, jamais de données brutes).
   - Fallback : si <3 utilisateurs dans le secteur → afficher « Données insuffisantes ».

**Migration DB :**
- Fonction `public.sector_benchmarks(_sector text)` SECURITY DEFINER SQL stable, retourne `TABLE(total bigint, positive_pct numeric, negative_pct numeric, avg_per_user numeric, user_count bigint)`.
- GRANT EXECUTE TO authenticated.

### Fichiers touchés
- `supabase/functions/google-reviews-scan/index.ts` (nouveau)
- `supabase/config.toml` (bloc verify_jwt)
- `src/pages/Settings.tsx` (bouton import)
- Migration SQL (fonction benchmark)
- `src/pages/Analytics.tsx` (nouveau, ~350 lignes)
- `src/App.tsx` (route lazy)
- `src/components/layout/AppSidebar.tsx` + `BottomNav.tsx` (lien)
- `src/lib/i18n.ts` (clés `nav.analytics`, `analytics.*`)

### Ordre d'exécution
1. Migration `sector_benchmarks` (async, attend approbation).
2. En parallèle : écrire la function Google Reviews + la page Analytics + la config.
3. Test edge function via `curl_edge_functions`.
4. Vérif build.