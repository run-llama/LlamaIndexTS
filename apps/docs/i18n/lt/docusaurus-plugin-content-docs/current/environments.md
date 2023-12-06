---
sidebar_position: 5
---

# Aplinkos

`Ši dokumentacija buvo automatiškai išversta ir gali turėti klaidų. Nedvejodami atidarykite Pull Request, jei norite pasiūlyti pakeitimus.`

LlamaIndex šiuo metu oficialiai palaiko NodeJS 18 ir NodeJS 20.

## NextJS Aplikacijos maršrutizatorius

Jei naudojate NextJS Aplikacijos maršrutizatoriaus maršrutų tvarkyklės / serverio funkcijas, turėsite naudoti NodeJS režimą:

```js
export const runtime = "nodejs"; // numatytasis
```

ir turėsite pridėti išimtį pdf-parse savo next.config.js

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Prideda pdf-parse į tikrąjį NodeJS režimą su NextJS Aplikacijos maršrutizatoriumi
  },
};

module.exports = nextConfig;
```
