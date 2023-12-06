---
sidebar_position: 5
---

# Ambienti

`Questa documentazione è stata tradotta automaticamente e può contenere errori. Non esitare ad aprire una Pull Request per suggerire modifiche.`

LlamaIndex attualmente supporta ufficialmente NodeJS 18 e NodeJS 20.

## Router dell'app NextJS

Se stai utilizzando i gestori di route/router dell'app NextJS, dovrai utilizzare la modalità NodeJS:

```js
export const runtime = "nodejs"; // predefinito
```

e dovrai aggiungere un'eccezione per pdf-parse nel tuo next.config.js

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Mette pdf-parse nella modalità NodeJS effettiva con il router dell'app NextJS
  },
};

module.exports = nextConfig;
```
