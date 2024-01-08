---
sidebar_position: 5
---

# Medii de lucru

`Această documentație a fost tradusă automat și poate conține erori. Nu ezitați să deschideți un Pull Request pentru a sugera modificări.`

LlamaIndex suportă oficial în prezent NodeJS 18 și NodeJS 20.

## Routerul aplicației NextJS

Dacă utilizați handler-ele de rute/funcții serverless ale Routerului aplicației NextJS, va trebui să utilizați modul NodeJS:

```js
export const runtime = "nodejs"; // implicit
```

și va trebui să adăugați o excepție pentru pdf-parse în fișierul next.config.js

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Plasează pdf-parse în modul NodeJS real cu Routerul aplicației NextJS
  },
};

module.exports = nextConfig;
```
