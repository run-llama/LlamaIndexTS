---
sidebar_position: 5
---

# Keskkonnad

`See dokumentatsioon on tõlgitud automaatselt ja võib sisaldada vigu. Ärge kartke avada Pull Request, et pakkuda muudatusi.`

LlamaIndex toetab praegu ametlikult NodeJS 18 ja NodeJS 20.

## NextJS rakenduse marsruuter

Kui kasutate NextJS rakenduse marsruuteri marsruutide käsitlejaid/serverita funktsioone, peate kasutama NodeJS režiimi:

```js
export const runtime = "nodejs"; // vaikimisi
```

ja peate lisama erandi pdf-parse jaoks oma next.config.js failis

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Paneb pdf-parse tegelikult NodeJS režiimi koos NextJS rakenduse marsruuteriga
  },
};

module.exports = nextConfig;
```
