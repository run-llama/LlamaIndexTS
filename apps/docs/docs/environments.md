---
sidebar_position: 5
---

# Environments

LlamaIndex currently officially supports NodeJS 18 and NodeJS 20.

## NextJS App Router

If you're using NextJS App Router route handlers/serverless functions, you'll need to use the NodeJS mode:

```js
export const runtime = "nodejs"; // default
```
