# Phase 5 — Polissage Final et Fonctionnalites Manquantes, change la couleurs de la police de connexion qui est blanche mets la en noir pour que cela soit visible

Toutes les phases precedentes sont implementees. Cette derniere phase comble les lacunes restantes pour une application veritablement complete et utilisable.

---

## 1. Export de Donnees Fonctionnel

Les boutons "Telecharger" dans Rapports ne font qu'afficher un toast. Les rendre fonctionnels :

- **Export CSV** des mentions filtrees (bouton dans la page Mentions)
- **Export CSV** du tableau concurrentiel (bouton dans Competitors)
- **Generation de contenu telechargeable** dans Rapports (fichier texte avec les donnees du rapport)

Utiliser `Blob` + `URL.createObjectURL` + `<a download>` pour generer les fichiers cote client.

**Fichiers modifies** : `Mentions.tsx`, `Competitors.tsx`, `Reports.tsx`

## 2. Composants Glass Manquants

`GeoHeatmap.tsx` et `RecentMentions.tsx` n'utilisent pas encore le style `glass-card` et `rounded-2xl`. Les mettre a jour pour la coherence visuelle.

**Fichiers modifies** : `GeoHeatmap.tsx`, `RecentMentions.tsx`

## 3. Simulation de Rafraichissement en Temps Reel

Ajouter un bouton "Actualiser" dans le Dashboard et les Mentions qui :

- Affiche un spinner pendant 1s
- Simule l'ajout d'une nouvelle mention aleatoire dans la liste
- Met a jour le compteur de mentions dans les stats

**Fichiers modifies** : `Dashboard.tsx`, `Mentions.tsx`

## 4. Page Profil Complete

Le lien "Mon profil" dans le dropdown du header redirige vers Settings. Ajouter plus de profondeur :

- Afficher la date d'inscription (simulee, stockee dans localStorage a l'inscription)
- Afficher le plan actif (stocke dans localStorage)
- Bouton "Changer de plan" qui redirige vers `/pricing`

**Fichier modifie** : `Settings.tsx`

## 5. Amelioration de la Page Alertes

- Ajouter un **filtre par severite** (critique/warning/info) avec des boutons toggle
- Afficher un compteur par type d'alerte en haut de la page

**Fichier modifie** : `Alerts.tsx`

## 6. Footer Global et Version

Ajouter un petit footer dans `AppLayout.tsx` affichant "© 2026 @robase — v1.0" en bas de la zone de contenu.

**Fichier modifie** : `AppLayout.tsx`

## 7. Mot de Passe Oublie

Ajouter un lien "Mot de passe oublie ?" sur la page Login qui ouvre un dialog avec un champ email et un bouton "Envoyer le lien" (simulation avec toast).

**Fichier modifie** : `Login.tsx`

---

## Details techniques


| Fichier                               | Modifications                                     |
| ------------------------------------- | ------------------------------------------------- |
| `src/pages/Mentions.tsx`              | Bouton export CSV, bouton actualiser              |
| `src/pages/Competitors.tsx`           | Bouton export CSV du tableau                      |
| `src/pages/Reports.tsx`               | Telechargement reel de fichier texte              |
| `src/components/GeoHeatmap.tsx`       | Style glass-card rounded-2xl                      |
| `src/components/RecentMentions.tsx`   | Style glass-card rounded-2xl                      |
| `src/pages/Dashboard.tsx`             | Bouton actualiser avec spinner                    |
| `src/pages/Settings.tsx`              | Date inscription, plan actif, bouton changer plan |
| `src/pages/Alerts.tsx`                | Filtre par severite, compteurs                    |
| `src/components/layout/AppLayout.tsx` | Footer global                                     |
| `src/pages/Login.tsx`                 | Dialog mot de passe oublie                        |


**Aucun nouveau fichier a creer.**