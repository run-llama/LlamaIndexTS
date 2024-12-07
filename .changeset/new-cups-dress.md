---
"@llamaindex/core": patch
---

The compact and refine response synthesizer (retrieved by using `getResponseSynthesizer('compact')`) has been fixed to return the original source nodes that were provided to it in its response. Previous to this it was returning the compacted text chunk documents.
