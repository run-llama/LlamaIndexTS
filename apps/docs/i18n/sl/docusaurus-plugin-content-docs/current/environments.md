---
sidebar_position: 5
---

# Prostredia

`Táto dokumentácia bola automaticky preložená a môže obsahovať chyby. Neváhajte otvoriť Pull Request na navrhnutie zmien.`

LlamaIndex momentálne oficiálne podporuje NodeJS 18 a NodeJS 20.

## NextJS App Router

Ak používate spracovatele trás/serveless funkcie NextJS App Router, budete potrebovať použiť režim NodeJS:

```js
export const runtime = "nodejs"; // predvolené
```

a budete musieť pridať výnimku pre pdf-parse vo vašom next.config.js

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Puts pdf-parse in actual NodeJS mode with NextJS App Router
  },
};

module.exports = nextConfig;
```
