---
sidebar_position: 5
---

# Retriever (Abrufgerät)

`Diese Dokumentation wurde automatisch übersetzt und kann Fehler enthalten. Zögern Sie nicht, einen Pull Request zu öffnen, um Änderungen vorzuschlagen.`

Ein Retriever in LlamaIndex ist das, was verwendet wird, um `Node`s anhand einer Abfragezeichenfolge aus einem Index abzurufen. Ein `VectorIndexRetriever` ruft die k-ähnlichsten Knoten ab. Ein `SummaryIndexRetriever` hingegen ruft alle Knoten unabhängig von der Abfrage ab.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// Knoten abrufen!
const nodesWithScore = await retriever.retrieve("Abfragezeichenfolge");
```

## API-Referenz

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)

"
