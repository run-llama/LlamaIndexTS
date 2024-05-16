---
"llamaindex": patch
"@llamaindex/env": patch
---

refactor: remove `defaultFS` from parameters

We don't accept passing fs in the parameter since it's unnecessary for a determined JS environment.

This was a polyfill way for the non-Node.js environment, but now we use another way to polyfill APIs.
