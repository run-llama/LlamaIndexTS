---
sidebar_position: 5
---

# 检索器

在 LlamaIndex 中，检索器用于使用查询字符串从索引中获取 `Node`。`VectorIndexRetriever` 将获取前 k 个最相似的节点。与此同时，`SummaryIndexRetriever` 将获取所有节点，无论查询如何。

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// 获取节点！
const nodesWithScore = await retriever.retrieve("query string");
```

## API 参考

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)
