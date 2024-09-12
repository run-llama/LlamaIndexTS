---
sidebar_position: 5
---

# Retriever

A retriever in LlamaIndex is what is used to fetch `Node`s from an index using a query string.

- [VectorIndexRetriever](../api/classes/VectorIndexRetriever.md) will fetch the top-k most similar nodes. Ideal for dense retrieval to find most relevant nodes.
- [SummaryIndexRetriever](../api/classes/SummaryIndexRetriever.md) will fetch all nodes no matter the query. Ideal when complete context is necessary, e.g. analyzing large datasets.
- [SummaryIndexLLMRetriever](../api/classes/SummaryIndexLLMRetriever.md) utilizes an LLM to score and filter nodes based on relevancy to the query.
- [KeywordTableLLMRetriever](../api/classes/KeywordTableLLMRetriever.md) uses an LLM to extract keywords from the query and retrieve relevant nodes based on keyword matches.
- [KeywordTableSimpleRetriever](../api/classes/KeywordTableSimpleRetriever.md) uses a basic frequency-based approach to extract keywords and retrieve nodes.
- [KeywordTableRAKERetriever](../api/classes/KeywordTableRAKERetriever.md) uses the RAKE (Rapid Automatic Keyword Extraction) algorithm to extract keywords from the query, focusing on co-occurrence and context for keyword-based retrieval.

```typescript
const retriever = vectorIndex.asRetriever({
  similarityTopK: 3,
});

// Fetch nodes!
const nodesWithScore = await retriever.retrieve({ query: "query string" });
```
