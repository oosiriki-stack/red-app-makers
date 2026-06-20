# Plan d'exécution

Votre demande couvre ~25 sujets distincts. Pour livrer du code qui marche réellement (et non un patchwork), je propose de découper en **6 vagues**. Chaque vague est livrée et testable avant de passer à la suivante.

---

## Vague 1 — Correctifs critiques + CSS badge (immédiat)

1. **CSS global** : masquer `#lovable-badge` dans `src/index.css`.
2. **Bug sentiments Dashboard** : les compteurs positif/neutre/négatif n'affichent rien → corriger la requête / mapping sur `mentions.sentiment`.
3. **OAuth Google / Apple 404 sur mobile** : vérifier `redirect_uri`, configurer le provider Apple côté Lovable Cloud, et ajouter la gestion correcte de `lovable.auth.signInWithOAuth` avec retour mobile.
4. **Renommer "requête" → "surveillance"** partout dans Alertes & Mentions.

## Vague 2 — Lot 3 : Sources africaines & scraping

- Seed RSS feeds africains (Abidjan.net, Senego, Koaci, Jeune Afrique, Financial Afrik, etc.) dans table `rss_feeds`.
- Edge function `fetch-rss` (cron 30 min) qui pousse dans `mentions`.
- Scrapers Facebook Groups / TikTok comments / WhatsApp Business via **Apify** (token déjà présent) — actors publics dédiés.
- Page Settings → onglet **Sources** pour activer/désactiver chaque source.

## Vague 3 — Lot 4 : Notifications multi-canal

- **SMS** via GatewayAPI (connector).
- **Slack** via webhook URL (champ utilisateur).
- **MS Teams** via webhook.
- **WhatsApp** via Meta Cloud API (nécessite `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_ID`).
- **Email** via Resend (déjà disponible).
- Table `notification_channels` + UI Settings → Notifications avec toggle par canal + test d'envoi.

## Vague 4 — Lot 5 : Sécurité (RBAC, MFA, audit, chiffrement)

- MFA TOTP (`supabase.auth.mfa`).
- HIBP password check (activable via `configure_auth`).
- Table `audit_logs` + triggers sur tables sensibles + page `SuperAdmin → Journal`.
- RBAC déjà en place via `user_roles` → étendre aux rôles workspace (`owner`, `admin`, `analyst`, `viewer`).
- Bannière sécurité : "Données chiffrées AES-256 au repos, TLS 1.3 en transit" (Lovable Cloud le fournit nativement, à documenter).
- Auth sociale **LinkedIn** + **Facebook** : non supportés nativement Lovable Cloud → je vous expliquerai la limite et proposerai une alternative (Supabase direct provider config requise).

## Vague 5 — Gating par formule (Starter / Business / Premium / Entreprise)

- Mettre à jour `subscriptions.plan` enum : `trial | starter | business | premium | enterprise`.
- Créer `plan_limits` (marques max, users max, mentions/mois, features booléennes : alertes IA, analyse concurrentielle, API, langues africaines, crise, support prioritaire).
- Hook `usePlanAccess()` qui lit le plan actif et expose `canAddBrand()`, `hasFeature('competitive')`, etc.
- Bloquer UI + enforcement DB (RLS sur création de `monitoring_settings`).
- Wave : 4 liens (mensuel + annuel × 4 plans) → mise à jour `Pricing.tsx`.

## Vague 6 — Mises à jour produit (textes, modules, comportements)

- **Dashboard** : refonte hero (score global + volume + barres pic).
- **Centre d'alertes** : alerte structurée auto (contexte + analyse IA + recommandations) avec objectif <15 min — afficher TTR.
- **Explorateur de mentions** : score d'impact propriétaire = `f(audience, engagement, |sentiment|)`.
- **Analyse comparative** : nouveau module `/competitors` avec benchmarking thématique.
- **Rapports auto** : edge function `generate-report` → PDF + PPTX (sectoriels gratuits aussi).
- **Pause auto surveillance précédente** : trigger DB + notif SuperAdmin + dossier "Archivées" visible côté user.
- **Pipeline FOCUS** : page `/pipeline` qui illustre les 8 étapes + 4 piliers (Surveiller / Comprendre / Anticiper / Décider).
- **Alertes intelligentes** : règles configurables (mots-clés + sentiment + seuil volume) + détection ML (déjà en place avec `detect-anomalies`).
- **FOCUS GPT** : intégrer une option "ChatGPT gratuit" — note : OpenAI n'expose pas d'API gratuite ; je vais utiliser **Lovable AI Gateway gratuit** (Gemini Flash) et l'étiqueter "FOCUS GPT" dans l'UI. Si vous voulez vraiment ChatGPT, il faudra une clé OpenAI payante.

---

## Points qui nécessitent votre décision avant de coder

1. **Apple Sign-In** : avez-vous un compte Apple Developer (99 $/an) ? Sans ça, impossible techniquement.
2. **LinkedIn / Facebook auth** : Lovable Cloud ne les supporte pas en managé. Voulez-vous (a) qu'on les retire, (b) qu'on bascule vers Supabase externe ?
3. **WhatsApp notifs** : OK pour créer compte Meta Business + me fournir `WHATSAPP_TOKEN` ?
4. **SMS GatewayAPI** : OK pour connecter le connecteur (vous aurez à coller la clé) ?
5. **"FOCUS GPT gratuit"** : OK pour utiliser Lovable AI Gateway (Gemini, gratuit pour vous) badgé "FOCUS GPT" ?
6. **Ordre** : on attaque dans l'ordre Vague 1 → 6, ou vous voulez prioriser autrement (ex : gating formules d'abord) ?

Répondez simplement « OK plan, vague 1 » (ou « tout en séquence ») et je démarre.
