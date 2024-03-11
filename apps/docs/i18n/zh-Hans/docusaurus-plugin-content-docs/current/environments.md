---
sidebar_position: 5
---

# 环境

LlamaIndex 目前官方支持 NodeJS 18 和 NodeJS 20。

## NextJS 应用路由器

如果您正在使用 NextJS 应用路由器的路由处理程序/无服务器函数，您将需要使用 NodeJS 模式：

```js
export const runtime = "nodejs"; // 默认
```
