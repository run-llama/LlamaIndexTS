---
"@llamaindex/core": patch
"llamaindex": patch
---

feat: node parser refactor

Align the text splitter logic with Python; it has almost the same logic as Python; Zod checks for input and better error messages and event system.

This change will not be considered a breaking change since it doesn't have a significant output difference from the last version,
but some edge cases will change, like the page separator and parameter for the constructor.
