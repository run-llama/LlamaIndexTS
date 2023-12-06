---
sidebar_position: 5
---

# Retriever

`Deze documentatie is automatisch vertaald en kan fouten bevatten. Aarzel niet om een Pull Request te openen om wijzigingen voor te stellen.`

Een retriever in LlamaIndex is wat wordt gebruikt om `Node`s op te halen uit een index met behulp van een zoekopdracht. Een `VectorIndexRetriever` haalt de meest vergelijkbare knooppunten op. Ondertussen haalt een `SummaryIndexRetriever` alle knooppunten op, ongeacht de zoekopdracht.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// Haal knooppunten op!
const nodesWithScore = await retriever.retrieve("zoekopdracht");
```

## API Referentie

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)

"
