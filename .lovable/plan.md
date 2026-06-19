
# Plan — Cahier des charges @robase

Tout ne peut pas être livré en un seul tour : certaines fonctionnalités exigent des intégrations payantes (SMS, Slack/Teams, WhatsApp Business, MFA), d'autres juste de l'UI + une edge function. Je propose **7 lots** ordonnés par priorité. Validez ceux à lancer (tous ou par étapes).

## État actuel (déjà en place)
- Collecte mentions (Apify, Google News, Bing, HN, Reddit, Mastodon, RSS) — `scheduled-scan`, `track-mentions`
- Sentiment positif/négatif/neutre (lexique FR) + alertes basiques (info/warning/critical)
- Dashboard score réputation, mentions, alertes, gauge
- Rapports exports CSV/PDF/Excel
- FocusGPT (recommandations IA contextualisées)
- Auth email + Google, rôles (`user_roles`), workspaces, RLS
- Notifications in-app + email (transac)
- Tableau de bord, paramètres, onboarding, PWA

## Lots à livrer

### Lot 1 — Analyse IA enrichie (priorité haute)
- **Émotions secondaires** (colère, satisfaction, inquiétude, enthousiasme) via Lovable AI Gateway (gemini-3-flash)
- **Détection sarcasme/ironie** adaptée nouchi, camfranglais, wolof
- **NER** : extraction marques, personnes, lieux, organisations
- **Classification thématique** auto : prix, service client, qualité produit, délais, UX
- Nouvelles colonnes `mentions`: `emotion`, `is_sarcastic`, `entities jsonb`, `theme`
- Edge function `enrich-mention` appelée après chaque insert (trigger ou batch)
- Filtres + badges visuels dans `Mentions.tsx`

### Lot 2 — Détection de crise & anomalies (priorité haute)
- Edge function `detect-anomalies` (cron 15 min) : z-score sur volume négatif vs baseline 7j
- Pic inhabituel → alerte `critical` + push notification + email
- **Tendances & sujets émergents** : clustering mots-clés (TF-IDF) sur 24h, affichés sur `Crisis.tsx`
- Score de risque réputationnel temps réel (0–100) sur Dashboard

### Lot 3 — Sources africaines locales
- Connecteurs RSS pré-remplis : Jeune Afrique, Abidjan.net, Senego, Koaci, Wakat Séra, Linfodrome, Seneweb…
- Scraping groupes Facebook publics ivoiriens/sénégalais via Apify (`facebook-groups-scraper`)
- WhatsApp Business : nécessite numéro vérifié + Meta Business — je scaffold l'edge function `whatsapp-webhook` et la config UI; l'activation réelle dépend du compte Meta du client
- Page **Sources** dans Settings pour activer/désactiver chaque source

### Lot 4 — Notifications multi-canaux
- **Email** : déjà ok
- **SMS** : via connecteur **GatewayAPI** (Lovable). Tableau préférences canal par type d'alerte
- **Slack** : webhook entrant (URL configurable dans Settings) + edge function `notify-slack`
- **Microsoft Teams** : via connecteur Lovable Teams (Graph API)
- **Push in-app** : déjà ok

### Lot 5 — Sécurité renforcée
- **MFA** (TOTP) via `supabase.auth.mfa` + page `Settings → Sécurité`
- **Journalisation actions** (`audit_logs` : user_id, action, target, ip, ua, created_at) avec triggers sur tables sensibles
- **HIBP check** activé sur signup
- Vue admin `SuperAdmin.tsx` pour consulter les audits

### Lot 6 — Recommandations IA contextualisées
- Bouton « Recommandation IA » sur chaque mention/alerte négative → réponse rédigée prête à publier (ton ajustable, déjà partiellement présent dans FocusGPT)
- Synthèse hebdo automatique (cron) : « 3 actions prioritaires cette semaine »

### Lot 7 — UX & polish
- Tutoriel guidé première connexion (`MarketingOnboarding` étendu)
- Onglet **Thèmes** sur Dashboard (camemberts par catégorie)
- Heatmap géographique des mentions (déjà `GeoHeatmap` — connecter aux vraies données)
- Export rapport exécutif PDF avec recommandations IA

## Détails techniques

| Lot | Tables / migrations | Edge functions | Connecteurs requis |
|---|---|---|---|
| 1 | `mentions` + colonnes emotion/entities/theme/sarcasm | `enrich-mention` (LOVABLE_API_KEY) | — |
| 2 | `anomaly_baselines` | `detect-anomalies` (cron) | — |
| 3 | `rss_feeds` seed, `whatsapp_config` | `whatsapp-webhook` | Apify (déjà) |
| 4 | `notification_channels`, `notification_prefs` | `notify-sms`, `notify-slack`, `notify-teams` | GatewayAPI, Microsoft Teams |
| 5 | `audit_logs`, triggers | — | — (Supabase MFA natif) |
| 6 | — | `weekly-digest` (cron) | — |
| 7 | — | — | — |

## Estimation
- Lot 1 + 2 : ~1 session (le plus à fort impact)
- Lot 3 + 4 : dépend des connecteurs à activer (je vous guiderai)
- Lot 5 + 6 + 7 : sessions courtes chacune

## Question
**Lancez-vous l'intégralité des 7 lots à la suite (long, plusieurs réponses), ou je commence par les Lots 1 + 2 (analyse IA + crise) qui apportent le plus de valeur immédiate ?**
