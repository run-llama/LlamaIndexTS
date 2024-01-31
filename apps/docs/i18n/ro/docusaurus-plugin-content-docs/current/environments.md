---
sidebar_position: 5
---

# Medii de lucru

`Această documentație a fost tradusă automat și poate conține erori. Nu ezitați să deschideți un Pull Request pentru a sugera modificări.`

LlamaIndex suportă oficial în prezent NodeJS 18 și NodeJS 20.

## Routerul aplicației NextJS

Dacă utilizați handler-ele de rute/funcții serverless ale Routerului aplicației NextJS, va trebui să utilizați modul NodeJS:

```js
export const runtime = "nodejs"; // implicit
```
