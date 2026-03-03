

# Phase Finale+ — Entreprise Surveillee, Trackers Actifs et Finalisation

## Objectif
Ajouter un onglet "Surveillance" dans les parametres pour configurer le nom de l'entreprise a surveiller, activer/desactiver les trackers par plateforme, et rendre ces donnees dynamiques dans toute l'application.

---

## 1. Onglet Surveillance dans Settings

Transformer `Settings.tsx` en page a onglets (Tabs) avec 3 sections :
- **Profil** : formulaire existant (nom, email, entreprise)
- **Surveillance** : nouveau — nom de la marque a surveiller, liste de plateformes avec switches on/off (X, Facebook, Instagram, LinkedIn, TikTok, Blog, Google), mots-cles supplementaires a tracker (champ texte avec tags)
- **Notifications** : section existante

Les donnees de surveillance sont persistees dans `localStorage` (`arobase_tracking`).

## 2. Donnees Dynamiques — Nom de l'Entreprise

Le nom de la marque surveillee (`arobase_tracking.brand`) est utilise dynamiquement dans :
- `Dashboard.tsx` : sous-titre "Vue d'ensemble de [Marque]" au lieu du texte statique
- `mockData.ts` : remplacer "Votre Marque" dans `competitors` et `voiceShare` par lecture du nom stocke
- `Competitors.tsx` : afficher le nom dynamique
- `RecentMentions.tsx` et `GeoHeatmap.tsx` : pas de changement necessaire (donnees mock)

## 3. Trackers Actifs — Indicateur Visuel

- Dans le **Dashboard**, ajouter une petite barre sous le titre montrant les plateformes actives avec des badges colores (ex: "X ✓", "Instagram ✓", "Blog ✗")
- Dans la **sidebar**, ajouter un indicateur vert "Tracking actif" a cote du logo quand au moins une plateforme est activee
- Sur la page **Mentions**, filtrer automatiquement les sources en fonction des plateformes activees dans les settings

## 4. Finalisation de l'Application

### Mentions
- Relier les filtres de source aux plateformes activees dans les trackers
- N'afficher dans le select que les sources activees

### Dashboard
- Afficher le nombre de plateformes actives dans une stat card supplementaire ou dans le sous-titre
- Le greeting inclut le nom de la marque : "Bonjour Jean — Surveillance de [Marque]"

### Onboarding initial
- Au premier acces (pas de `arobase_tracking` dans localStorage), afficher un dialog de bienvenue invitant l'utilisateur a configurer sa marque avant d'utiliser l'app. Bouton "Configurer" redirige vers `/settings` sur l'onglet Surveillance.

---

## Details techniques

| Fichier | Modifications |
|---|---|
| `src/pages/Settings.tsx` | Refonte avec Tabs (Profil / Surveillance / Notifications), formulaire marque + plateformes + mots-cles |
| `src/pages/Dashboard.tsx` | Lecture `arobase_tracking`, affichage dynamique du nom de marque et plateformes actives |
| `src/pages/Mentions.tsx` | Filtrage des sources basee sur les trackers actifs |
| `src/components/layout/AppSidebar.tsx` | Indicateur "Tracking actif" dans le footer |
| `src/data/mockData.ts` | Fonction helper pour remplacer "Votre Marque" dynamiquement |
| `src/pages/Competitors.tsx` | Nom dynamique de la marque |

**Aucun nouveau fichier a creer** — uniquement des modifications de fichiers existants.

