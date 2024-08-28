---
sidebar_position: 2
---

# Environments

We support Node.JS versions 18, 20 and 22, with experimental support for Deno, Bun and Vercel Edge functions.

## NextJS

If you're using NextJS you'll need to add `withLlamaIndex` to your `next.config.js` file. This will add the necessary configuration for included 3rd-party libraries to your build:

```js
// next.config.js
const withLlamaIndex = require("llamaindex/next");

module.exports = withLlamaIndex({
  // your next.js config
});
```

For details, check the latest [withLlamaIndex](https://github.com/run-llama/LlamaIndexTS/blob/main/packages/llamaindex/src/next.ts) implementation.
