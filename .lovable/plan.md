

# Phase 3 — Finalisation et Coherence

Phase 2 a ajoute les animations sur le Dashboard et l'Assistant IA, la jauge radiale, la heatmap, les mentions recentes et les toasts. Cette phase finalise l'application en appliquant ces ameliorations a toutes les pages et en ajoutant les derniers details manquants.

---

## 1. AnimatedPage sur toutes les pages restantes

Les pages suivantes n'ont pas encore le wrapper `AnimatedPage` :
- Mentions, Alertes, Concurrence, Rapports, Parametres, Tarification, Install

Chaque page sera wrappee avec `<AnimatedPage>` pour des transitions fluides.

## 2. Transitions de pages avec AnimatePresence

- Modifier `AppLayout.tsx` pour wrapper `<Outlet />` avec `AnimatePresence`
- Utiliser `useLocation()` comme cle pour declencher les animations d'entree/sortie entre les routes

## 3. Indicateurs de chargement Skeleton

- Ajouter un composant `DashboardSkeleton` qui s'affiche brievement au chargement du Dashboard (simulation avec un delai de 800ms)
- Utiliser le composant `Skeleton` de shadcn/ui deja present pour les cartes, graphiques et jauges

## 4. Navigation sidebar amelioree

- Renforcer l'indicateur actif dans la sidebar : ajouter une bordure laterale rouge (left border) sur l'element actif
- Augmenter le contraste du fond actif

## 5. Micro-interactions supplementaires

- Ajouter un effet `hover:scale` subtil sur les cartes du dashboard et les cartes d'influenceurs
- Ajouter un effet de transition sur les badges de sentiment au survol

## 6. Toast sur la page Rapports

- Ajouter un toast de confirmation au clic sur "Telecharger le dernier" et les boutons de telechargement individuels

## 7. Responsive mobile — corrections finales

- Page Tarification : empilement vertical des cartes sur mobile (deja en `md:grid-cols-3`, verifier le rendu)
- Page Concurrence : rendre le tableau scrollable horizontalement sur mobile
- Page Rapports : adapter le layout des cards de configuration sur mobile

---

## Details techniques

Fichiers a modifier :
- `src/pages/Mentions.tsx` — ajout AnimatedPage
- `src/pages/Alerts.tsx` — ajout AnimatedPage
- `src/pages/Competitors.tsx` — ajout AnimatedPage + table scrollable mobile
- `src/pages/Reports.tsx` — ajout AnimatedPage + toasts telechargement
- `src/pages/Settings.tsx` — ajout AnimatedPage
- `src/pages/Pricing.tsx` — ajout AnimatedPage
- `src/pages/Install.tsx` — ajout AnimatedPage
- `src/components/layout/AppLayout.tsx` — AnimatePresence autour de Outlet
- `src/components/NavLink.tsx` — renforcer le style actif avec bordure rouge
- `src/pages/Dashboard.tsx` — ajout skeleton loading + hover scale sur cartes
- `src/index.css` — classes utilitaires pour hover scale

Aucun nouveau fichier a creer. Principalement du wrapping et du polish CSS.

