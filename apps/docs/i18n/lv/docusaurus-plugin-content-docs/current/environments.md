---
sidebar_position: 5
---

# Vides

`Šis dokuments ir automātiski tulkots un var saturēt kļūdas. Nevilciniet atvērt Pull Request, lai ierosinātu izmaiņas.`

LlamaIndex pašlaik oficiāli atbalsta NodeJS 18 un NodeJS 20.

## NextJS lietotnes maršrutētājs

Ja izmantojat NextJS lietotnes maršrutētāja maršrutētājus/servera funkcijas, jums būs jāizmanto NodeJS režīms:

```js
export const runtime = "nodejs"; // noklusējums
```

un jums būs jāpievieno izņēmums pdf-parse savā next.config.js failā

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Ievieto pdf-parse faktiskajā NodeJS režīmā ar NextJS lietotnes maršrutētāju
  },
};

module.exports = nextConfig;
```
