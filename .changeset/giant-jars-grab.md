---
"@llamaindex/core": patch
---

feat: update workflow implementation

- combine await behavior with async iterator, now there's only one queue to handle the `startEvent`.
- each Context will have its own step map, so the step can be executed in parallel.
