---
"llamaindex": patch
---

fix: add `serializer` in doc store

`PostgresDocumentStore` now will not use JSON.stringify for better performance
