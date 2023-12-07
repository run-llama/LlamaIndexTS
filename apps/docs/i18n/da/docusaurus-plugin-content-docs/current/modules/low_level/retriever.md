---
sidebar_position: 5
---

# Retriever

`Denne dokumentation er blevet automatisk oversat og kan indeholde fejl. Tøv ikke med at åbne en Pull Request for at foreslå ændringer.`

En retriever i LlamaIndex er det, der bruges til at hente `Node` fra en indeks ved hjælp af en forespørgselsstreng. En `VectorIndexRetriever` vil hente de mest lignende noder i top-k. Imens vil en `SummaryIndexRetriever` hente alle noder, uanset forespørgslen.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// Hent noder!
const nodesWithScore = await retriever.retrieve("forespørgselsstreng");
```

## API Reference

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)

"
