

# Phase 6 — Refonte Visuelle Jaune Apple + Mobile-First + Taille de Police Ajustable

## Objectif
Transformer le theme de l'application du rouge au jaune/or, appliquer un design Apple encore plus epure, optimiser l'experience mobile, et ajouter un controle de taille de police dans les parametres.

---

## 1. Refonte Couleur : Rouge → Jaune/Or

Modifier `src/index.css` pour remplacer toutes les references `primary` (rouge `0 72%`) par un jaune/or Apple (`45 93% 47%` — similaire au jaune systeme Apple). Mettre a jour :
- Les variables CSS light et dark (--primary, --ring, --accent, --sidebar-primary, etc.)
- Les gradients (.text-gradient-red → .text-gradient-gold, .auth-gradient-bg, .glow-red → .glow-gold)
- Les orbs sur les pages auth

## 2. Design Apple Renforce

- **Sidebar** : fond plus epure, espacement plus genereux, police plus fine
- **Header** : hauteur augmentee a `h-16`, espacement respire, icones plus legeres
- **Cards** : ombres encore plus subtiles, bordures quasi invisibles, padding augmente
- **Boutons** : coins plus arrondis (rounded-2xl partout), poids de police `medium`
- Ajuster `tailwind.config.ts` : `--radius: 1.25rem`

## 3. Vue Mobile Optimisee

- **AppLayout** : padding reduit sur mobile (`p-3` au lieu de `p-4`)
- **Dashboard** : grille stat cards en `grid-cols-2` sur mobile au lieu de 1
- **Sidebar** : overlay mobile avec animation slide-in (deja supporte par shadcn mais verifier le comportement)
- **Header** : avatar et icones plus compacts sur mobile
- **Toutes les pages** : max-width responsive, textes tronques si besoin

## 4. Controle de Taille de Police

Ajouter dans `Settings.tsx` (onglet Profil ou nouveau onglet Accessibilite) :
- Un slider (3 niveaux : Petit / Normal / Grand) qui modifie une classe CSS sur `<html>`
- Persistance dans localStorage (`arobase_font_size`)
- Application dans `App.tsx` ou `main.tsx` au chargement
- Niveaux : `text-sm` (14px base), normal (16px), `text-lg` (18px base)

## 5. Coherence Couleur dans les Pages

Mettre a jour les references explicites au rouge dans :
- `AppSidebar.tsx` : `.glow-red-subtle` → `.glow-gold-subtle`
- `Login.tsx`, `Register.tsx` : gradient auth, couleurs des orbs
- `Pricing.tsx` : gradient barre populaire, badges
- `Dashboard.tsx` : badges plateformes
- `ReputationGauge.tsx` : couleur de l'arc du gauge

## 6. Note sur les API Reseaux Sociaux

Les API reelles des reseaux sociaux (X, Facebook, Instagram, etc.) necessitent des cles API et un backend. L'app fonctionne actuellement avec des donnees simulees. Pour activer de vraies API, il faudrait connecter Supabase/Cloud et configurer des edge functions avec les cles appropriees. Cette phase prepare l'architecture mais garde la simulation active.

---

## Details techniques

| Fichier | Modifications |
|---|---|
| `src/index.css` | Refonte complete des variables couleur (rouge → jaune/or), nouveaux gradients, glow gold |
| `tailwind.config.ts` | Radius augmente |
| `src/components/layout/AppSidebar.tsx` | Classes glow gold, espacement Apple |
| `src/components/layout/AppHeader.tsx` | Hauteur 16, espacement mobile |
| `src/components/layout/AppLayout.tsx` | Padding mobile reduit |
| `src/pages/Login.tsx` | Gradient jaune, orbs dores |
| `src/pages/Register.tsx` | Idem Login |
| `src/pages/Settings.tsx` | Slider taille de police + persistance |
| `src/pages/Dashboard.tsx` | Badges couleur or |
| `src/pages/Pricing.tsx` | Gradient et badges or |
| `src/components/ReputationGauge.tsx` | Arc couleur or |
| `src/main.tsx` | Restauration taille de police au chargement |

