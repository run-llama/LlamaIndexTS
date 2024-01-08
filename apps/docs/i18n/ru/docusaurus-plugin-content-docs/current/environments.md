---
sidebar_position: 5
---

# Окружения

`Эта документация была автоматически переведена и может содержать ошибки. Не стесняйтесь открывать Pull Request для предложения изменений.`

LlamaIndex в настоящее время официально поддерживает NodeJS 18 и NodeJS 20.

## Маршрутизатор приложений NextJS

Если вы используете обработчики маршрутов/безсерверные функции NextJS App Router, вам потребуется использовать режим NodeJS:

```js
export const runtime = "nodejs"; // по умолчанию
```

и вам потребуется добавить исключение для pdf-parse в вашем файле next.config.js

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Помещает pdf-parse в режим фактического NodeJS с помощью маршрутизатора приложений NextJS
  },
};

module.exports = nextConfig;
```
