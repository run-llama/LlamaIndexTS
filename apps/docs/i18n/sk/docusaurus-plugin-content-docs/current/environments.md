---
sidebar_position: 5
---

# Okolja

`Ta dokumentacija je bila samodejno prevedena in lahko vsebuje napake. Ne oklevajte odpreti Pull Request za predlaganje sprememb.`

LlamaIndex trenutno uradno podpira NodeJS 18 in NodeJS 20.

## Usmerjevalnik NextJS aplikacije

Če uporabljate usmerjevalnik NextJS aplikacije za obdelavo poti/obdelovalcev brez strežnika, boste morali uporabiti način NodeJS:

```js
export const runtime = "nodejs"; // privzeto
```

in v datoteko next.config.js dodajte izjemo za pdf-parse

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Postavi pdf-parse v dejanski način NodeJS z usmerjevalnikom NextJS aplikacije
  },
};

module.exports = nextConfig;
```
