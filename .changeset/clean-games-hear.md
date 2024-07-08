---
"llamaindex": patch
"@llamaindex/core": patch
---

refactor: move callback manager & llm to core module

For people who import `llamaindex/llms/base` or `llamaindex/llms/utils`,
use `@llamaindex/core/llms` and `@llamaindex/core/utils` instead.
