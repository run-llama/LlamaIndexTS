---
sidebar_position: 5
---

# Retriever

Un retriever dans LlamaIndex est ce qui est utilisé pour récupérer les `Node`s à partir d'un index en utilisant une chaîne de requête. Un `VectorIndexRetriever` récupérera les nœuds les plus similaires les plus proches. Pendant ce temps, un `SummaryIndexRetriever` récupérera tous les nœuds, peu importe la requête.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// Récupérer les nœuds !
const nodesWithScore = await retriever.retrieve("chaîne de requête");
```

## Référence de l'API

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever)
