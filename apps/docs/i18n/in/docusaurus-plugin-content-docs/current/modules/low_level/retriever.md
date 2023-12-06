---
sidebar_position: 5
---

# Retriever

`Dokumentasi ini telah diterjemahkan secara otomatis dan mungkin mengandung kesalahan. Jangan ragu untuk membuka Pull Request untuk mengusulkan perubahan.`

Retriever dalam LlamaIndex adalah yang digunakan untuk mengambil `Node` dari indeks menggunakan string query. Sebuah `VectorIndexRetriever` akan mengambil k node yang paling mirip. Sementara itu, `SummaryIndexRetriever` akan mengambil semua node tanpa memperdulikan query.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// Mengambil node!
const nodesWithScore = await retriever.retrieve("string query");
```

## Referensi API

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)

"
