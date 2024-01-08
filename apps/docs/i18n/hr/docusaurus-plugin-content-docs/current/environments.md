---
sidebar_position: 5
---

# Okruženja

`Ova dokumentacija je automatski prevedena i može sadržavati greške. Ne ustručavajte se otvoriti Pull Request za predlaganje promjena.`

LlamaIndex trenutno službeno podržava NodeJS 18 i NodeJS 20.

## NextJS App Router

Ako koristite NextJS App Router rukovatelje rutama/serverless funkcije, trebat ćete koristiti NodeJS način rada:

```js
export const runtime = "nodejs"; // zadano
```

i trebat ćete dodati iznimku za pdf-parse u vašem next.config.js

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Stavlja pdf-parse u stvarni NodeJS način rada s NextJS App Routerom
  },
};

module.exports = nextConfig;
```
