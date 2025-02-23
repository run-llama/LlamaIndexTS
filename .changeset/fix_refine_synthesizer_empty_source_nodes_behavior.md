---
"@llamaindex/core": patch
---

Refine synthesizer will now return an empty string as the response if an empty array of source nodes were provided. Before it would throw an internal error converting undefined to ReadableStream.
