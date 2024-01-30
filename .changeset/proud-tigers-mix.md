---
"llamaindex": patch
---

refactor: use `pdf2json` instead of `pdfjs-dist`

Please add `pdf2json` to `serverComponentsExternalPackages` if you have to parse pdf in runtime.

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf2json"],
  },
};

module.exports = nextConfig;
```
