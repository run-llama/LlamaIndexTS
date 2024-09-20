---
"llamaindex": patch
---

feat: update `PGVectorStore`

- move constructor parameter `config.user` | `config.database` | `config.password` | `config.connectionString` into `config.clientConfig`
- if you pass `pg.Client` or `pg.Pool` instance to `PGVectorStore`, move it to `config.client`, setting `config.shouldConnect` to false if it's already connected
- default value of `PGVectorStore.collection` is now `"data"` instead of `""` (empty string)
