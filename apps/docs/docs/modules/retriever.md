---
sidebar_position: 5
---

# Retriever

A retriever in LlamaIndex is what is used to fetch `Node`s from an index using a query string. Aa `VectorIndexRetriever` will fetch the top-k most similar nodes. Meanwhile, a `SummaryIndexRetriever` will fetch all nodes no matter the query.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// Fetch nodes!
const nodesWithScore = await retriever.retrieve("query string");
```

## API Reference

- [SummaryIndexRetriever](../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../api/classes/VectorIndexRetriever.md)
