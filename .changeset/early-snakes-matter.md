---
"@llamaindex/core": patch
"@llamaindex/env": patch
"llamaindex": patch
"@llamaindex/node-parser": patch
"@llamaindex/workflow": patch
---

- fix agent chat message not saved into the task context when streaming
- fix async local storage might use `node:async_hook` in edge-light/workerd condition
