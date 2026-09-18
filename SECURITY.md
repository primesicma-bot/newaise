# Sécurité Aise

Cette version est un frontend/PWA statique conçu pour Netlify.

Mesures incluses :
- Content-Security-Policy restrictive
- anti-clickjacking (CSP frame-ancestors + X-Frame-Options)
- HSTS
- Referrer-Policy
- X-Content-Type-Options
- Permissions-Policy restrictive
- COOP/CORP
- aucune clé secrète dans le frontend
- démo « Décide pour moi » exécutée localement
- entrées utilisateur échappées avant insertion HTML
- service worker limité aux ressources du site

Limite importante :
aucun site Internet ne peut garantir une invulnérabilité absolue. Cette couche protège le frontend statique. Dès qu'une base de données/authentification est ajoutée, la sécurité doit aussi être appliquée côté serveur : RLS, validation serveur, contrôle d'accès, sessions, rate limiting, journalisation et gestion des secrets.
