---
sidebar_position: 5
---

# Среди

`Тази документация е преведена автоматично и може да съдържа грешки. Не се колебайте да отворите Pull Request, за да предложите промени.`

LlamaIndex в момента официално поддържа NodeJS 18 и NodeJS 20.

## NextJS App Router

Ако използвате обработчици на маршрути/сървърни функции на NextJS App Router, ще трябва да използвате режима на NodeJS:

```js
export const runtime = "nodejs"; // по подразбиране
```

и ще трябва да добавите изключение за pdf-parse във вашия next.config.js

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Поставя pdf-parse в реален режим на NodeJS с NextJS App Router
  },
};

module.exports = nextConfig;
```
