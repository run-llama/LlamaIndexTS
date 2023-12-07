---
sidebar_position: 5
---

# Miljøer

`Denne dokumentation er blevet automatisk oversat og kan indeholde fejl. Tøv ikke med at åbne en Pull Request for at foreslå ændringer.`

LlamaIndex understøtter i øjeblikket officielt NodeJS 18 og NodeJS 20.

## NextJS App Router

Hvis du bruger NextJS App Router route handlers/serverless functions, skal du bruge NodeJS-tilstand:

```js
export const runtime = "nodejs"; // standard
```

og du skal tilføje en undtagelse for pdf-parse i din next.config.js

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Sætter pdf-parse i faktisk NodeJS-tilstand med NextJS App Router
  },
};

module.exports = nextConfig;
```
