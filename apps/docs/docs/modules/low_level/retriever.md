---
sidebar_position: 5
---

# Retriever

A retriever in LlamaIndex is what is used to fetch `Node`s from an index using a query string. For example, a `ListIndexRetriever` will fetch all nodes no matter the query. Meanwhile, a `VectorIndexRetriever` will only fetch the top-k most similar nodes.

```typescript
const retriever = vector_index.asRetriever()
retriever.similarityTopK = 3;

// Fetch nodes!
const nodes = await retriever.aretrieve("query string");
```
