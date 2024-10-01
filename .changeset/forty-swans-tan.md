---
"@llamaindex/core": patch
---

Fix #1278: resolved issue where the id\_ was not correctly passed as the id when creating a TextNode. As a result, the upsert operation to the vector database was using a generated ID instead of the provided document ID, if available.
