# Accueil, couleur de marque et phases suivantes

## Résultat attendu
- Ajouter dans l’en-tête connecté un bouton clairement nommé « Accueil » qui revient à la page publique.
- Uniformiser les éléments orange autour d’une seule couleur de marque, y compris les états actifs, dégradés et couleurs d’installation mobile, tout en conservant des textes lisibles.
- Terminer la phase hors-ligne déjà engagée, puis valider la qualité prévue par le cahier des charges.

## Mise en œuvre
1. Remplacer les variations orange dispersées par les couleurs sémantiques de la charte et retirer les variantes incohérentes des principaux menus.
2. Transformer l’icône d’accueil existante en commande explicite, compacte sur mobile et libellée sur les écrans plus larges.
3. Relier le cache local aux données consultées si nécessaire et vérifier le bandeau de coupure/reconnexion ainsi que l’installation PWA.
4. Tester les pages publiques et connectées sur ordinateur et mobile : navigation, lisibilité, fonctionnement hors-ligne et absence d’erreurs.
5. Mettre à jour le cahier des charges uniquement avec les validations réellement effectuées.

## Détails techniques
- La couleur unique sera pilotée par les variables globales existantes afin de rester cohérente en modes clair et sombre.
- Les données privées ne seront jamais partagées entre comptes dans le cache local.
- Aucun module métier ni règle d’abonnement ne sera modifié dans cette phase.
