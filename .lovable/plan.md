

# Plan de développement — @robase 🔴

Application de veille e-réputationnelle augmentée par IA — Interface complète avec données fictives, thème rouge, installable en PWA.

---

## 1. Design System & Thème Rouge
- Palette de couleurs rouge comme couleur primaire (nuances de rouge foncé/vif)
- Code couleur sentiment : vert (positif), orange (neutre), rouge (négatif)
- Mode sombre intégré
- Typographie moderne et professionnelle
- Logo "@robase" en texte stylisé

## 2. Authentification (pages maquette)
- Page de connexion avec email/mot de passe
- Page d'inscription avec choix de rôle (Admin, Manager, Analyste, Client)
- Écran d'authentification multifacteur (visuel)

## 3. Dashboard Global
- Score d'e-réputation global avec jauge visuelle
- Graphiques d'évolution des mentions (positif/neutre/négatif) avec Recharts
- Statistiques clés : nombre de mentions, sentiment moyen, alertes actives
- Heatmap géographique simplifiée
- Widget de tendances et mots-clés

## 4. Flux de Mentions Temps Réel
- Liste scrollable de mentions fictives (Facebook, X, Instagram, TikTok, LinkedIn, blogs)
- Filtres par source, sentiment, date
- Badge de sentiment coloré sur chaque mention
- Détail d'une mention au clic

## 5. Centre d'Alertes
- Liste d'alertes intelligentes (pic de mentions, mention négative influente, risque de crise)
- Niveaux de sévérité (critique, avertissement, info)
- Notifications push visuelles

## 6. Analyse Concurrentielle & Radar d'Influence
- Tableau comparatif dynamique avec concurrents fictifs
- Part de voix digitale en graphique circulaire
- Liste d'influenceurs avec score d'engagement
- Graphiques d'évolution comparative

## 7. Assistant IA de Réponse
- Interface de chat pour générer des réponses contextualisées (simulé)
- Sélection du ton : institutionnel, commercial, empathique, juridique
- Historique des réponses générées
- Bouton de validation avant publication

## 8. Module Reporting
- Prévisualisation d'un rapport type
- Options de périodicité (quotidien, hebdomadaire, mensuel)
- Personnalisation logo/couleurs (visuel)
- Bouton de téléchargement PDF (simulé)

## 9. Navigation & Layout
- Sidebar de navigation avec icônes pour tous les modules
- Navigation en 3 niveaux maximum
- Header avec recherche, notifications, profil utilisateur
- Responsive : adapté mobile, tablette et desktop

## 10. Configuration PWA
- Installation de vite-plugin-pwa
- Manifest avec nom "@robase", icônes et thème rouge
- Page d'installation dédiée `/install`
- Support hors ligne basique
- Meta tags optimisés pour mobile

## 11. Pages Secondaires
- Page de profil utilisateur et paramètres
- Page de tarification (Gratuit / Pro / Entreprise)
- Page 404 personnalisée

