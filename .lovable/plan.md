

# Phase 3 — Finalisation et Coherence

Cette phase applique les ameliorations de la Phase 2 (animations, micro-interactions, toasts) a toutes les pages restantes et ajoute les derniers details manquants.

---

## 1. AnimatedPage sur toutes les pages restantes

Wrapper chaque page avec `<AnimatedPage>` pour des transitions fluides :
- `Mentions.tsx`, `Alerts.tsx`, `Competitors.tsx`, `Reports.tsx`, `Settings.tsx`, `Pricing.tsx`, `Install.tsx`

## 2. Transitions de pages avec AnimatePresence

Modifier `AppLayout.tsx` pour utiliser `AnimatePresence` autour de `<Outlet />` avec `useLocation()` comme cle, afin de declencher les animations d'entree/sortie entre les routes.

## 3. Indicateurs de chargement Skeleton

Ajouter un etat de chargement simule (800ms) au Dashboard avec un composant `DashboardSkeleton` utilisant le `Skeleton` de shadcn/ui pour les cartes, graphiques et la jauge.

## 4. Navigation sidebar amelioree

Renforcer l'indicateur actif dans `NavLink.tsx` : ajouter une bordure laterale rouge (`border-l-3 border-primary`) et un fond actif plus contraste sur l'element selectionne.

## 5. Micro-interactions supplementaires

- Ajouter `hover:scale-[1.02] transition-transform` sur les cartes du Dashboard
- Ajouter un effet de transition sur les badges de sentiment au survol
- Ajouter `hover-scale` aux cartes d'influenceurs sur la page Concurrence

## 6. Toasts sur la page Rapports

Ajouter un toast de confirmation (via `sonner`) au clic sur "Telecharger le dernier" et sur chaque bouton de telechargement individuel.

## 7. Responsive mobile — corrections finales

- `Competitors.tsx` : wrapper le tableau dans un `div` avec `overflow-x-auto` pour le scroll horizontal mobile
- `Reports.tsx` : verifier que les cards de configuration s'empilent sur mobile
- `Pricing.tsx` : deja en `md:grid-cols-3`, confirmer le rendu mobile

---

## Details techniques

**Fichiers modifies** (aucun nouveau fichier) :

| Fichier | Modifications |
|---|---|
| `src/pages/Mentions.tsx` | + AnimatedPage wrapper |
| `src/pages/Alerts.tsx` | + AnimatedPage wrapper |
| `src/pages/Competitors.tsx` | + AnimatedPage + table scrollable + hover cartes influenceurs |
| `src/pages/Reports.tsx` | + AnimatedPage + toasts telechargement |
| `src/pages/Settings.tsx` | + AnimatedPage wrapper |
| `src/pages/Pricing.tsx` | + AnimatedPage wrapper |
| `src/pages/Install.tsx` | + AnimatedPage wrapper |
| `src/components/layout/AppLayout.tsx` | + AnimatePresence + useLocation |
| `src/components/NavLink.tsx` | + bordure rouge active + contraste |
| `src/pages/Dashboard.tsx` | + skeleton loading (800ms) + hover scale cartes |
| `src/index.css` | + classes utilitaires hover si necessaire |

