---
sidebar_position: 5
---

# Prostředí

`Tato dokumentace byla automaticky přeložena a může obsahovat chyby. Neváhejte otevřít Pull Request pro navrhování změn.`

LlamaIndex aktuálně oficiálně podporuje NodeJS 18 a NodeJS 20.

## NextJS App Router

Pokud používáte NextJS App Router pro zpracování tras/route a serverless funkce, budete muset použít režim NodeJS:

```js
export const runtime = "nodejs"; // výchozí hodnota
```

a budete muset přidat výjimku pro pdf-parse ve vašem next.config.js

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Přepne pdf-parse do režimu NodeJS s NextJS App Router
  },
};

module.exports = nextConfig;
```
