# Déployer SPL GESTION DE SUIVI — multi-utilisateurs

## Variables Vercel

```text
DATABASE_URL=URL_POSTGRESQL_NEON
SPL_SESSION_SECRET=SECRET_ALEATOIRE_D_AU_MOINS_32_CARACTERES
```

## Étapes

1. Créez une base PostgreSQL sur Neon.
2. Importez ce projet GitHub dans Vercel.
3. Ajoutez les deux variables.
4. Cliquez sur Deploy.

Les tables et le compte démo sont créés automatiquement. Chaque visiteur peut ensuite créer son propre compte privé depuis `/inscription`.
