---
"llamaindex": patch
---

feat: use conditional exports

The benefit of conditional exports is we split the llamaindex into different files. This will improve the tree shake if you are building web apps.

This also requires node16 (see https://nodejs.org/api/packages.html#conditional-exports).

If you are seeing typescript issue `TS2724`('llamaindex' has no exported member named XXX):

1. update `moduleResolution` to `bundler` in `tsconfig.json`, more for the web applications like Next.js, and vite, but still works for ts-node or tsx.
2. consider the ES module in your project, add `"type": "module"` into `package.json` and update `moduleResolution` to `node16` or `nodenext` in `tsconfig.json`.

We still support both cjs and esm, but you should update `tsconfig.json` to make the typescript happy.
