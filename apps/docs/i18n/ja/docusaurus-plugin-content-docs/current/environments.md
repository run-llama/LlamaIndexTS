---
sidebar_position: 5
---

# 環境

`このドキュメントは自動的に翻訳されており、誤りを含んでいる可能性があります。変更を提案するためにプルリクエストを開くことを躊躇しないでください。`

LlamaIndexは現在、公式にNodeJS 18とNodeJS 20をサポートしています。

## NextJSアプリケーションルーター

NextJSアプリケーションルーターのルートハンドラー/サーバーレス関数を使用している場合、NodeJSモードを使用する必要があります。

```js
export const runtime = "nodejs"; // デフォルト
```

また、next.config.jsでpdf-parseの例外を追加する必要があります。

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // pdf-parseを実際のNodeJSモードに配置するためのNextJSアプリケーションルーター
  },
};

module.exports = nextConfig;
```
