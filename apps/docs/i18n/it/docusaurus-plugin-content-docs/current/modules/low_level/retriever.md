---
sidebar_position: 5
---

# Retriever

`Questa documentazione è stata tradotta automaticamente e può contenere errori. Non esitare ad aprire una Pull Request per suggerire modifiche.`

Un retriever in LlamaIndex è ciò che viene utilizzato per recuperare i `Node` da un indice utilizzando una stringa di query. Un `VectorIndexRetriever` recupererà i nodi più simili in cima alla lista. Nel frattempo, un `SummaryIndexRetriever` recupererà tutti i nodi indipendentemente dalla query.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// Recupera i nodi!
const nodesWithScore = await retriever.retrieve("stringa di query");
```

## Riferimento API

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)

"
