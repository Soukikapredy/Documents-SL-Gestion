# Sécurité multi-compte

- Chaque mot de passe est haché avec scrypt et un sel aléatoire.
- Les sessions utilisent un cookie HTTP-only signé.
- Toutes les lectures et écritures sont filtrées par identifiant de compte.
- Les présences et performances vérifient que le travailleur appartient au compte connecté.
- Ne partagez jamais DATABASE_URL ni SPL_SESSION_SECRET.
- Utilisez un secret de session aléatoire d’au moins 32 caractères.
- La PWA ne met pas les pages métier privées en cache.
