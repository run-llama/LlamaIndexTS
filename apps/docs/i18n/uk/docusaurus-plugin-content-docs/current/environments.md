---
sidebar_position: 5
---

# Середовища

`Ця документація була автоматично перекладена і може містити помилки. Не соромтеся відкривати Pull Request, щоб запропонувати зміни.`

LlamaIndex наразі офіційно підтримує NodeJS 18 та NodeJS 20.

## Маршрутизатор додатків NextJS

Якщо ви використовуєте обробники маршрутів/функції безсерверного режиму NextJS App Router, вам потрібно використовувати режим NodeJS:

```js
export const runtime = "nodejs"; // за замовчуванням
```

і вам потрібно додати виняток для pdf-parse у вашому next.config.js

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Розміщує pdf-parse у фактичному режимі NodeJS з NextJS App Router
  },
};

module.exports = nextConfig;
```
