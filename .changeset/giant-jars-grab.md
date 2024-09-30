---
"@llamaindex/core": minor
---

feat: update workflow API v2

- combine await behavior with async iterator, now there's only one queue to handle the `startEvent`.
- each Context will have its own step map, so the step can be executed in parallel.
- remove `context.globals` from API, you can provide your own context by `.with` API
