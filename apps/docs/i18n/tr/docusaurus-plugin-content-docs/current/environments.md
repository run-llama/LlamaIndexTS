---
sidebar_position: 5
---

# Ortamlar

`Bu belge otomatik olarak çevrilmiştir ve hatalar içerebilir. Değişiklik önermek için bir Pull Request açmaktan çekinmeyin.`

LlamaIndex şu anda resmi olarak NodeJS 18 ve NodeJS 20'yi desteklemektedir.

## NextJS Uygulama Yönlendirici

Eğer NextJS Uygulama Yönlendirici rota işleyicileri/sunucusuz fonksiyonlar kullanıyorsanız, NodeJS modunu kullanmanız gerekecektir:

```js
export const runtime = "nodejs"; // varsayılan
```

ve next.config.js dosyanıza pdf-parse için bir istisna eklemeniz gerekecektir:

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // pdf-parse'ı NextJS Uygulama Yönlendirici ile gerçek NodeJS modunda kullanır
  },
};

module.exports = nextConfig;
```
