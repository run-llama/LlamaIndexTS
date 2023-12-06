---
sidebar_position: 5
---

# 環境

`此文件已自動翻譯，可能包含錯誤。如有更改建議，請毫不猶豫地提交 Pull Request。`

LlamaIndex 目前正式支援 NodeJS 18 和 NodeJS 20。

## NextJS 應用程式路由器

如果您正在使用 NextJS 應用程式路由器的路由處理程序/無伺服器函式，您需要使用 NodeJS 模式：

```js
export const runtime = "nodejs"; // 預設值
```

並且您需要在 next.config.js 中為 pdf-parse 添加一個例外：

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // 將 pdf-parse 放在實際的 NodeJS 模式中與 NextJS 應用程式路由器一起使用
  },
};

module.exports = nextConfig;
```
