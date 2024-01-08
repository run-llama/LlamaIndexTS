---
sidebar_position: 5
---

# Miljøer

`Denne dokumentasjonen har blitt automatisk oversatt og kan inneholde feil. Ikke nøl med å åpne en Pull Request for å foreslå endringer.`

LlamaIndex støtter for øyeblikket offisielt NodeJS 18 og NodeJS 20.

## NextJS App Router

Hvis du bruker NextJS App Router rutehåndterere/serverløse funksjoner, må du bruke NodeJS-modus:

```js
export const runtime = "nodejs"; // standard
```

og du må legge til et unntak for pdf-parse i next.config.js-filen din

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Setter pdf-parse i faktisk NodeJS-modus med NextJS App Router
  },
};

module.exports = nextConfig;
```
