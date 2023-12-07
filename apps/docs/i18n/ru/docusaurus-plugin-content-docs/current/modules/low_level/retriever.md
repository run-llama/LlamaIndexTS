---
sidebar_position: 5
---

# Retriever (Извлекатель)

`Эта документация была автоматически переведена и может содержать ошибки. Не стесняйтесь открывать Pull Request для предложения изменений.`

Извлекатель в LlamaIndex - это то, что используется для получения узлов (`Node`) из индекса с использованием строки запроса. `VectorIndexRetriever` извлечет топ-k наиболее похожих узлов. В то же время, `SummaryIndexRetriever` извлечет все узлы, независимо от запроса.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// Получение узлов!
const nodesWithScore = await retriever.retrieve("строка запроса");
```

## Справочник по API

- [SummaryIndexRetriever (Извлекатель сводного индекса)](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever (Извлекатель сводного индекса LLM)](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever (Извлекатель векторного индекса)](../../api/classes/VectorIndexRetriever.md)
