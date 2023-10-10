---
sidebar_position: 5
---

# Environments

LlamaIndex currently officially supports NodeJS 18 and NodeJS 20.

## NextJS App Router

If you're using NextJS App Router route handlers/serverless functions, you'll need to use the NodeJS mode:

```js
export const runtime = "nodejs" // default
```

and you'll need to add an exception for pdf-parse in your next.config.js

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"], // Puts pdf-parse in actual NodeJS mode with NextJS App Router
  },
};

module.exports = nextConfig;
```
