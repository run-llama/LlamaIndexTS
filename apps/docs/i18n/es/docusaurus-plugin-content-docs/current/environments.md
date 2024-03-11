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
