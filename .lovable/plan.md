

# Phase 4 — Design Apple, Paiement et Activation

Refonte visuelle style Apple (glassmorphism, espacement genereux, typographie epuree), mise a jour de la tarification avec paiement Wave, et activation fonctionnelle de l'application.

---

## 1. Design System Apple-Style

Appliquer un style minimaliste inspire d'Apple tout en conservant la palette rouge :

- **Glassmorphism** : cartes avec `backdrop-blur-xl`, fond semi-transparent (`bg-white/70 dark:bg-white/5`), bordures subtiles (`border-white/20`)
- **Ombres douces** : `shadow-xl shadow-black/5` au lieu des bordures dures
- **Espacement genereux** : augmenter le padding des cartes et sections
- **Typographie** : titres plus grands et plus legers (font-light pour les grands titres)
- **Coins arrondis** : augmenter `--radius` a `1rem`
- **Transitions fluides** : `transition-all duration-500 ease-out` sur les cartes au hover

**Fichiers modifies** :
- `src/index.css` : nouvelles classes utilitaires `.glass-card`, `.glass-sidebar`, augmenter le radius, ajouter des ombres
- `tailwind.config.ts` : ajout d'ombres et de blur custom

## 2. Refonte des Composants Visuels

### Sidebar (AppSidebar.tsx)
- Fond avec glassmorphism (blur + semi-transparent)
- Icones plus grandes, espacement accru
- Logo avec un effet de glow subtil rouge

### Header (AppHeader.tsx)
- Barre de recherche avec fond glass et coins arrondis plus larges
- Avatar avec ring animee
- Notifications avec animation de pulse

### Cards globales
- Toutes les cartes passent en style glass (fond semi-transparent + blur)
- Hover avec elevation et leger scale
- Bordures avec gradient subtil

### Dashboard (Dashboard.tsx)
- Jauge de reputation avec effet de glow
- Cartes stats avec icones colorees en fond circulaire translucide
- Graphiques avec courbes plus douces et couleurs attenuees

### Toutes les pages
- Appliquer le style glass aux cartes de Mentions, Alertes, Concurrence, Rapports, Settings, Install

## 3. Page Tarification — Paiement Wave

Refonte complete de `Pricing.tsx` :

- **3 plans en francais** :
  - **Starter** : 15 000 FCFA/mois — fonctionnalites de base
  - **Pro** (populaire) : 45 000 FCFA/mois — toutes les fonctionnalites
  - **Entreprise** : Sur devis — support prioritaire, API, SSO

- **Promotion annuelle** : banniere en haut avec badge "Economisez 46%" pour l'offre annuelle a 5 000 FCFA (au lieu du prix mensuel cumule)
- **Bouton de paiement** : lien direct vers `https://pay.wave.com/m/M_ci_mZX836uJEiGE/c/ci/` pour le plan annuel
- **Pas d'essai gratuit** : les boutons CTA sont "S'abonner" ou "Payer maintenant"
- **Design Apple** : cartes glass, grande carte Pro mise en avant avec glow, toggle mensuel/annuel

## 4. Activation Fonctionnelle

Rendre les interactions reellement fonctionnelles avec l'etat local :

### Login / Register (Login.tsx, Register.tsx)
- Les formulaires redirigent vers `/` apres soumission (simulation d'auth avec localStorage)
- Stockage du nom d'utilisateur dans localStorage
- Header affiche le nom de l'utilisateur connecte

### Dashboard
- Les stats sont cliquables et redirigent vers les pages correspondantes (Mentions, Alertes, etc.)

### Mentions (Mentions.tsx)
- Filtres fonctionnels (deja en place)
- Ajout d'un compteur de resultats filtre
- Bouton "Voir sur [source]" ouvre un lien (simulee avec toast)

### Alertes (Alerts.tsx)
- Bouton "Tout marquer comme lu" fonctionne (etat local)
- Bouton "Voir" sur chaque alerte ouvre un detail/toast
- Badge "Nouveau" disparait apres clic

### Assistant IA (AIAssistant.tsx)
- Le bouton "Generer" produit une reponse simulee apres un delai de 1.5s avec un loader
- La reponse generee s'ajoute a l'historique local
- Copier et Approuver fonctionnent deja (toasts)

### Rapports (Reports.tsx)
- "Nouveau rapport" ouvre un dialog de configuration
- Les telechargements affichent un toast (deja en place)

### Settings (Settings.tsx)
- "Sauvegarder" met a jour localStorage et affiche un toast de confirmation
- Les switches de notifications persistent dans localStorage

### Header (AppHeader.tsx)
- Le badge de notifications affiche le nombre d'alertes non lues
- Clic sur la cloche redirige vers `/alerts`
- "Se deconnecter" dans le dropdown efface localStorage et redirige vers `/login`
- "Mon profil" redirige vers `/settings`

### Pricing (Pricing.tsx)
- Le bouton de paiement annuel ouvre le lien Wave dans un nouvel onglet
- Les autres boutons affichent un toast "Contactez-nous"

## 5. Effets Visuels Avances

- **Gradient anime** sur le fond de la page de login/register (gradient rouge/orange qui se deplace lentement)
- **Particules/orbes flottantes** subtiles sur la page de login (CSS only avec des pseudo-elements animes)
- **Glow effect** sur la carte Pro de la tarification
- **Hover 3D** subtil sur les cartes (perspective + rotateX/Y au hover via CSS)
- **Smooth counter animation** amelioree sur les stats du dashboard

---

## Details techniques

**Fichiers modifies** :
| Fichier | Modifications |
|---|---|
| `src/index.css` | Classes glass, gradient anime, glow, hover 3D, radius augmente |
| `tailwind.config.ts` | Ombres custom, blur, animations |
| `src/components/layout/AppSidebar.tsx` | Style glass, glow logo |
| `src/components/layout/AppHeader.tsx` | Glass, navigation fonctionnelle, deconnexion |
| `src/components/layout/AppLayout.tsx` | Fond avec gradient subtil |
| `src/pages/Dashboard.tsx` | Cartes glass, stats cliquables, hover 3D |
| `src/pages/Pricing.tsx` | Refonte complete : plans FCFA, promo annuelle 5000, lien Wave, toggle |
| `src/pages/Login.tsx` | Auth localStorage, gradient anime en fond, redirection |
| `src/pages/Register.tsx` | Auth localStorage, gradient anime en fond, redirection |
| `src/pages/Mentions.tsx` | Compteur resultats, cartes glass |
| `src/pages/Alerts.tsx` | Marquer comme lu fonctionnel, badge dynamique |
| `src/pages/AIAssistant.tsx` | Generation simulee avec loader, historique local |
| `src/pages/Reports.tsx` | Dialog nouveau rapport |
| `src/pages/Settings.tsx` | Sauvegarde localStorage, toasts |
| `src/pages/Install.tsx` | Cartes glass |
| `src/pages/MFA.tsx` | Style glass |
| `src/pages/NotFound.tsx` | Style glass |
| `src/components/ReputationGauge.tsx` | Glow effect |

**Aucun nouveau fichier a creer.**

