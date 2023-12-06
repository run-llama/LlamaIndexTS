---
sidebar_position: 5
---

# Lingkungan

`Dokumentasi ini telah diterjemahkan secara otomatis dan mungkin mengandung kesalahan. Jangan ragu untuk membuka Pull Request untuk mengusulkan perubahan.`

LlamaIndex saat ini secara resmi mendukung NodeJS 18 dan NodeJS 20.

## Router Aplikasi NextJS

Jika Anda menggunakan penangan rute/handler serverless NextJS App Router, Anda perlu menggunakan mode NodeJS:

```js
export const runtime = "nodejs"; // default
```

dan Anda perlu menambahkan pengecualian untuk pdf-parse di next.config.js Anda

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Menempatkan pdf-parse dalam mode NodeJS sebenarnya dengan NextJS App Router
  },
};

module.exports = nextConfig;
```
