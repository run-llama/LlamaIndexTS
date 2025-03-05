---
"@llamaindex/env": patch
"@llamaindex/core": patch
"llamaindex": patch
---

Fix edge runtime builds by adding missing packages to env package. Make gpt-tokenizer optional for llamaindex to reduce package size.
