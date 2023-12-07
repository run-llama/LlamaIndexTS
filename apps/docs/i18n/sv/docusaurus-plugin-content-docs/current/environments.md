---
sidebar_position: 5
---

# Miljöer

`Denna dokumentation har översatts automatiskt och kan innehålla fel. Tveka inte att öppna en Pull Request för att föreslå ändringar.`

LlamaIndex stöder för närvarande officiellt NodeJS 18 och NodeJS 20.

## NextJS App Router

Om du använder NextJS App Router route handlers/serverless functions måste du använda NodeJS-läget:

```js
export const runtime = "nodejs"; // standard
```

och du måste lägga till ett undantag för pdf-parse i din next.config.js

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Sätter pdf-parse i faktiskt NodeJS-läge med NextJS App Router
  },
};

module.exports = nextConfig;
```
