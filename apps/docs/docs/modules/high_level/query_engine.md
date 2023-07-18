---
sidebar_position: 3
---

# QueryEngine

A query engine wraps a `Retriever` and a `ResponseSynthesizer` into a pipeline, that will use the query string to fetech nodes and then send them to the LLM to generate a response.

```typescript
const queryEngine = index.asQueryEngine();
const response = queryEngine.query("query string");
```