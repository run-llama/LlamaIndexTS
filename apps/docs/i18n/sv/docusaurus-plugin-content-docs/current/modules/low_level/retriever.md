---
sidebar_position: 5
---

`Denna dokumentation har översatts automatiskt och kan innehålla fel. Tveka inte att öppna en Pull Request för att föreslå ändringar.`

# Retriever (Hämtare)

En hämtare i LlamaIndex används för att hämta `Node`s från en index med hjälp av en frågesträng. En `VectorIndexRetriever` kommer att hämta de mest liknande noderna enligt top-k. Å andra sidan kommer en `SummaryIndexRetriever` att hämta alla noder oavsett frågan.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// Hämta noder!
const nodesWithScore = await retriever.retrieve("frågesträng");
```

## API-referens

- [SummaryIndexRetriever (SammanfattningIndexHämtare)](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever (SammanfattningIndexLLMHämtare)](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever (VektorIndexHämtare)](../../api/classes/VectorIndexRetriever.md)
