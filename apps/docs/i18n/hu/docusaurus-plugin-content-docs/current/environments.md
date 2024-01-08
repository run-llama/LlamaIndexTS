---
sidebar_position: 5
---

# Környezetek

`Ezt a dokumentációt automatikusan fordították le, és tartalmazhat hibákat. Ne habozzon nyitni egy Pull Requestet a változtatások javasolására.`

A LlamaIndex jelenleg hivatalosan támogatja a NodeJS 18 és a NodeJS 20 verziókat.

## NextJS alkalmazás útválasztó

Ha a NextJS alkalmazás útválasztó útválasztó kezelőket/szerver nélküli funkciókat használ, akkor a NodeJS módot kell használnia:

```js
export const runtime = "nodejs"; // alapértelmezett
```

és hozzá kell adnia egy kivételt a pdf-parse-hez a next.config.js fájlban

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // A pdf-parse-t valódi NodeJS módban helyezi el a NextJS alkalmazás útválasztó
  },
};

module.exports = nextConfig;
```
