---
sidebar_position: 5
---

# Environnements

LlamaIndex prend actuellement en charge officiellement NodeJS 18 et NodeJS 20.

## Routeur d'application NextJS

Si vous utilisez des gestionnaires de route du routeur d'application NextJS ou des fonctions serverless, vous devrez utiliser le mode NodeJS :

```js
export const runtime = "nodejs"; // par défaut
```

et vous devrez ajouter une exception pour pdf-parse dans votre fichier next.config.js

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Met pdf-parse en mode NodeJS réel avec le routeur d'application NextJS
  },
};

module.exports = nextConfig;
```
