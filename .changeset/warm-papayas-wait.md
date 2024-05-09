---
"llamaindex": patch
"@llamaindex/core-e2e": patch
"@llamaindex/next-agent-test": patch
"@llamaindex/nextjs-edge-runtime-test": patch
---

fix: import `@xenova/transformers`

For now, if you use llamaindex in next.js, you need to add a plugin from `llamaindex/next` to ensure some module resolutions are correct.
