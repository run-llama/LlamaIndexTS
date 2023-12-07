---
sidebar_position: 5
---

# Retriever (Alıcı)

`Bu belge otomatik olarak çevrilmiştir ve hatalar içerebilir. Değişiklik önermek için bir Pull Request açmaktan çekinmeyin.`

LlamaIndex'te bir alıcı, bir sorgu dizesi kullanarak bir dizinden `Node`'ları almak için kullanılan bir bileşendir. Bir `VectorIndexRetriever` en benzer düğümleri getirecektir. Öte yandan, bir `SummaryIndexRetriever` sorguya bakılmaksızın tüm düğümleri getirecektir.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// Düğümleri getir!
const nodesWithScore = await retriever.retrieve("sorgu dizesi");
```

## API Referansı

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)

"
