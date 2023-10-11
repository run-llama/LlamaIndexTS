---
sidebar_position: 5
---

# Environments

LlamaIndex currently officially supports NodeJS 18 and NodeJS 20.

## NextJS App Router

If you're using NextJS App Router route handlers/serverless functions, you'll need to use the NodeJS mode:

```js
export const runtime = "vercel" // updated to support Vercel Edge Runtime
```

and you'll need to add an exception for pdf-parse in your next.config.js

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // next.config.js
    /** @type {import('next').NextConfig} */
    const nextConfig = {
      experimental: {
        serverComponentsExternalPackages: ["pdf-parse", "@dqbd/tiktoken"], // Added @dqbd/tiktoken to the list
      },
    };
    
    module.exports = nextConfig;
  },
};

module.exports = nextConfig;
```
