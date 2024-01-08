---
sidebar_position: 5
---

# محیط ها

`undefined`

LlamaIndex در حال حاضر به طور رسمی NodeJS 18 و NodeJS 20 را پشتیبانی می کند.

## مسیریابی برنامه NextJS

اگر از مسیریابی برنامه NextJS استفاده می کنید، برای استفاده از حالت NodeJS نیاز خواهید داشت:

```js
export const runtime = "nodejs"; // پیش فرض
```

و برای pdf-parse باید یک استثناء در next.config.js اضافه کنید

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // pdf-parse را در حالت واقعی NodeJS با مسیریاب برنامه NextJS قرار می دهد
  },
};

module.exports = nextConfig;
```
