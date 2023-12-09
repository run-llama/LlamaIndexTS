---
sidebar_position: 5
---

# Entornos

`Esta documentación ha sido traducida automáticamente y puede contener errores. No dudes en abrir una Pull Request para sugerir cambios.`

LlamaIndex actualmente admite oficialmente NodeJS 18 y NodeJS 20.

## Enrutador de aplicaciones NextJS

Si estás utilizando los controladores de ruta/funciones sin servidor del enrutador de aplicaciones NextJS, deberás utilizar el modo NodeJS:

```js
export const runtime = "nodejs"; // por defecto
```

y deberás agregar una excepción para pdf-parse en tu archivo next.config.js

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Pone pdf-parse en el modo NodeJS real con el enrutador de aplicaciones NextJS
  },
};

module.exports = nextConfig;
```
