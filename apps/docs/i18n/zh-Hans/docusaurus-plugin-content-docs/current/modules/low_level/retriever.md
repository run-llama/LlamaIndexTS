---
sidebar_position: 5
---

# 检索器

在LlamaIndex中，检索器用于使用查询字符串从索引中获取`Node`。`VectorIndexRetriever`将获取最相似的前k个节点。同时，`SummaryIndexRetriever`将获取所有节点，不管查询内容如何。

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// 获取节点！
const nodesWithScore = await retriever.retrieve("查询字符串");
```

## API 参考

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)
