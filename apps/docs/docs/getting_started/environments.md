---
sidebar_position: 2
---

# Environments

We support Node.JS versions 18, 20 and 22, with experimental support for Deno, Bun and Vercel Edge functions.

## NextJS App Router

If you're using NextJS App Router route handlers/serverless functions, you'll need to use the NodeJS mode:

```js
export const runtime = "nodejs"; // default
```
