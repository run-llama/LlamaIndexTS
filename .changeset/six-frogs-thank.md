---
"llamaindex": patch
---

Fix database insertion for `PGVectorStore`

It will now:

- throw an error if there is an insertion error.
- Upsert documents with the same id.
- add all documents to the database as a single `INSERT` call (inside a transaction).
