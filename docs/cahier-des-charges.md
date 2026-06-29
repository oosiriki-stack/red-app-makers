# Cahier des charges — FOCUS (e-réputation)

_Dernière mise à jour : 2026-06-29 — Statut : **Finalisé v1.0**_

## 1. Vision
Plateforme africaine de veille e-réputation propulsée par l'IA, mobile-first, ton et UX inspirés d'Apple. Surveillance multi-canal, alerte temps-réel, IA d'analyse + de réponse, gestion de crise et reporting prêts pour les décideurs.

## 2. Modules (statut final)

| # | Module | Statut | Notes |
|---|---|---|---|
| 1 | Authentification (email + Google/Apple/Facebook/LinkedIn) | ✅ | Toggle mot de passe, OAuth redirect same-origin |
| 2 | Onboarding & Surveillance (marque + secteur + pays) | ✅ | Pause/Play, archivage des anciennes surveillances |
| 3 | Tracker automatique (X, FB, IG, LinkedIn, TikTok, Blogs, Google Avis, Reddit) | ✅ | Seed déterministe + Apify pour sources réelles |
| 4 | Mentions (flux infini, blur paywall, suppression unitaire/bulk) | ✅ | Résolveur de source garantissant l'accès |
| 5 | Alertes & Notifications (in-app, son Apple, WhatsApp) | ✅ | Throttle 45s, batching |
| 6 | IA — FOCUS GPT (analyse, sentiment, sarcasme, émotions, réponses 3 tons) | ✅ | Gemini Flash + fallback playbooks |
| 7 | Gestion de crise (playbooks, niveaux, escalade) | ✅ | Accessible depuis la barre de recherche |
| 8 | Concurrence (suivi, parts de voix, comparatif) | ✅ | Contenu réel |
| 9 | Influenceurs / Réseaux sociaux / Espace | ✅ | Refonte best-in-class |
| 10 | Rapports & Exports (CSV, XLSX, PDF, PPTX) | ✅ | Auto-scheduler |
| 11 | Paiement & Abonnements (Wave, FCFA) | ✅ | Promo 21 jours full-access en cours |
| 12 | Super Admin (carte utilisateurs Afrique, activation licences) | ✅ | Realtime push aux clients |
| 13 | PWA installable (Android + iOS) | ✅ | navigateFallback configuré |
| 14 | Langues locales | 🛠️ En cours | Placeholder affiché |

## 3. Résolveur de source (nouveau)
Edge function `resolve-source` : pour chaque mention, génère une liste ordonnée d'URL candidates et probe en parallèle (timeout 1.5 s) :
1. URL directe (si valide et non bloquée),
2. Front-end alternatif consultable (Nitter pour X, recherche Reddit/YouTube native),
3. Recherche Google `site:plateforme` ciblée sur un snippet de contenu + marque,
4. Bing / DuckDuckGo en dernier recours.

Le client ouvre instantanément un onglet sur la requête Google ciblée (anti pop-up blocker) puis redirige vers la meilleure URL résolue → **aucune mention ne reste « non consultable »**.

## 4. Performance
- Code-splitting des routes (`React.lazy` + `Suspense`).
- React Query : `staleTime 60s`, retry 1, pas de refetch on focus.
- Realtime channel unique par souscription + cleanup `unmount`.
- Workbox cache 5 MiB, PWA `navigateFallback: /index.html`.
- Seeding intervalle 10 min, toasts throttlés à 45 s.

## 5. Sécurité
- RLS sur toutes les tables `public.*` + `GRANT` explicites.
- `has_role` SECURITY DEFINER, `user_roles` séparé des profils.
- Pas de social-login sans provider configuré côté Supabase.
- Dépendances majeures upgradées (zéro vulnérabilité high/medium au dernier scan).

## 6. Roadmap restante
- Finaliser l'i18n (FR / EN / Wolof / Bambara / Lingala).
- Connecter Wave Webhook → validation auto des paiements.
- Brancher Apify Actor LinkedIn (en remplacement progressif du seed).

— Document de référence projet.
