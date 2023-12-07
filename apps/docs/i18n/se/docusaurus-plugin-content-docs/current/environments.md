---
sidebar_position: 5
---

# Okruženja

`Ova dokumentacija je automatski prevedena i može sadržati greške. Ne oklevajte da otvorite Pull Request za predlaganje izmena.`

LlamaIndex trenutno zvanično podržava NodeJS 18 i NodeJS 20.

## NextJS App Router

Ako koristite NextJS App Router rute handlera/serverless funkcija, moraćete koristiti NodeJS režim:

```js
export const runtime = "nodejs"; // podrazumevano
```

i moraćete dodati izuzetak za pdf-parse u vašem next.config.js fajlu

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Stavlja pdf-parse u stvarni NodeJS režim sa NextJS App Routerom
  },
};

module.exports = nextConfig;
```
