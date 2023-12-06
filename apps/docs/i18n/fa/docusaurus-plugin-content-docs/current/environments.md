---
sidebar_position: 5
---

`این مستند به طور خودکار ترجمه شده و ممکن است حاوی اشتباهات باشد. در صورت پیشنهاد تغییرات، دریغ نکنید از باز کردن یک Pull Request.`

# محیط ها

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
