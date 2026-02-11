

# Phase 2 — Polissage et Ameliorations

L'ensemble des pages de la maquette (Dashboard, Mentions, Alertes, Concurrence, Assistant IA, Rapports, Parametres, Tarification, Login, Register, MFA, Install, 404) est en place avec le theme rouge et la configuration PWA.

La phase suivante vise a ameliorer l'experience utilisateur et la qualite visuelle globale.

---

## 1. Animations et transitions (framer-motion)

- Ajouter des animations d'entree sur les cartes du Dashboard (fade-in + slide-up echelonne)
- Animer les transitions entre pages via un composant wrapper `AnimatedPage`
- Ajouter des micro-interactions sur les boutons et les badges (hover scale)
- Animer le compteur du score de reputation (animation de comptage progressif)

## 2. Ameliorations du Dashboard

- Ajouter une heatmap geographique simplifiee (grille de regions avec intensite de couleur) comme prevu dans le plan initial
- Ajouter une section "Dernieres mentions" avec les 3 mentions les plus recentes directement sur le dashboard
- Ameliorer la jauge de score avec un composant circulaire anime (gauge radiale)

## 3. Optimisation responsive mobile

- Adapter les grilles de cartes pour mobile (1 colonne)
- Rendre les graphiques Recharts scrollables horizontalement sur petits ecrans
- Adapter les filtres des mentions en mode empile sur mobile
- Ameliorer la page Tarification en mode carousel horizontal sur mobile
- Tester et ajuster le header (recherche masquee sur mobile avec bouton toggle)

## 4. Ameliorations de la page 404

- Personnaliser avec le branding @robase (logo, couleurs rouge, illustration)
- Ajouter un message en francais et un bouton de retour stylise

## 5. Details de finition

- Ajouter un indicateur de chargement squelette (skeleton) sur les cartes
- Ajouter des tooltips informatifs sur les statistiques du dashboard
- Ajouter un toast de confirmation quand l'utilisateur clique "Approuver" dans l'assistant IA ou "Copier"
- Ameliorer la navigation : indicateur actif plus visible dans la sidebar

---

## Details techniques

- **framer-motion** : deja installe, utilisation de `motion.div` avec `initial/animate/exit` et `AnimatePresence` pour les transitions
- **Gauge radiale** : composant SVG custom avec animation CSS ou framer-motion
- **Heatmap** : grille CSS simple avec des intensites de couleur basees sur les donnees fictives (pas de librairie de carte)
- **Skeleton** : utilisation du composant `Skeleton` de shadcn/ui deja present
- **Toasts** : utilisation de `sonner` deja configure

Fichiers a creer :
- `src/components/AnimatedPage.tsx` — wrapper d'animation pour les pages
- `src/components/ReputationGauge.tsx` — jauge circulaire SVG
- `src/components/GeoHeatmap.tsx` — heatmap geographique simplifiee
- `src/components/RecentMentions.tsx` — widget dernieres mentions

Fichiers a modifier :
- `src/pages/Dashboard.tsx` — integration gauge, heatmap, mentions recentes
- `src/pages/NotFound.tsx` — redesign avec branding
- `src/App.tsx` — wrapper AnimatePresence pour transitions
- Toutes les pages — wrapping avec `AnimatedPage`
- `src/pages/AIAssistant.tsx` — ajout toasts sur actions
- `src/components/layout/AppHeader.tsx` — responsive mobile
- `src/index.css` — animations CSS additionnelles si necessaire

