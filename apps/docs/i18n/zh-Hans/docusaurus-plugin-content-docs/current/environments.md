---
sidebar_position: 5
---

# 环境

LlamaIndex目前正式支持NodeJS 18和NodeJS 20。

## NextJS 应用程序路由器

如果您正在使用NextJS应用程序路由器路由处理程序/无服务器函数，您将需要使用NodeJS模式：

```js
export const runtime = "nodejs"; // 默认
```

并且您需要在next.config.js中为pdf-parse添加一个异常

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // 将pdf-parse放入实际的NodeJS模式与NextJS应用程序路由器
  },
};

module.exports = nextConfig;
```
