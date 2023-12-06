---
sidebar_position: 5
---

# Omgevingen

`Deze documentatie is automatisch vertaald en kan fouten bevatten. Aarzel niet om een Pull Request te openen om wijzigingen voor te stellen.`

LlamaIndex ondersteunt momenteel officieel NodeJS 18 en NodeJS 20.

## NextJS App Router

Als je NextJS App Router route handlers/serverless functies gebruikt, moet je de NodeJS-modus gebruiken:

```js
export const runtime = "nodejs"; // standaard
```

en je moet een uitzondering toevoegen voor pdf-parse in je next.config.js

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Zet pdf-parse in de werkelijke NodeJS-modus met NextJS App Router
  },
};

module.exports = nextConfig;
```
