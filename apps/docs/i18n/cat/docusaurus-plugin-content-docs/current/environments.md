---
sidebar_position: 5
---

# Entorns

`Aquesta documentació s'ha traduït automàticament i pot contenir errors. No dubteu a obrir una Pull Request per suggerir canvis.`

LlamaIndex actualment suporta oficialment NodeJS 18 i NodeJS 20.

## Enrutador d'aplicacions NextJS

Si utilitzeu els gestors de rutes/funcions sense servidor de l'enrutador d'aplicacions NextJS, haureu d'utilitzar el mode NodeJS:

```js
export const runtime = "nodejs"; // per defecte
```

i haureu d'afegir una excepció per a pdf-parse al vostre next.config.js

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Posiciona pdf-parse en el mode NodeJS real amb l'enrutador d'aplicacions NextJS
  },
};

module.exports = nextConfig;
```
