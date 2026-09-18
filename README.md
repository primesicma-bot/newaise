# Aise — version Netlify

Version statique/PWA du site Aise, adaptée au template Lyniq fourni par l'utilisateur et au prompt maître Aise.

## Ce qui a été adapté
- Direction artistique éditoriale noir/blanc + accent vert acide inspirée du template Lyniq.
- Tous les textes orientés e-commerce / vente remplacés par le contenu Aise.
- Aucun abonnement, aucun plan payant, aucun tarif d'inscription.
- CTA centrés sur l'essai gratuit et l'utilisation de la démo.
- Animations liées au scroll et réversibles lors de la remontée.
- Responsive mobile-first.
- PWA et fonctionnement hors-ligne du shell.
- Démo « Décide pour moi » entièrement locale.
- Headers de sécurité Netlify renforcés.

## Déploiement Netlify
1. Décompresser le ZIP.
2. Dans Netlify, créer un nouveau projet et choisir le déploiement manuel.
3. Glisser-déposer le contenu de ce dossier.

## Sécurité
Cette version est un frontend statique : elle n'expose ni base de données ni clé secrète. Les headers de sécurité réduisent fortement les vecteurs courants côté navigateur.
Une sécurité absolue n'est pas possible. Si un backend/authentification est ajouté plus tard, il faudra aussi sécuriser le serveur, les sessions, les permissions DB, la validation et le rate limiting.
