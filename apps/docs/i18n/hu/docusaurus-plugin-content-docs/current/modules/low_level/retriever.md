---
sidebar_position: 5
---

# Retriever (Visszakereső)

`Ezt a dokumentációt automatikusan fordították le, és tartalmazhat hibákat. Ne habozzon nyitni egy Pull Requestet a változtatások javasolására.`

A visszakereső (retriever) a LlamaIndex-ben azt használjuk, hogy lekérje a `Node`-okat egy indexből egy lekérdezési karakterlánc segítségével. Egy `VectorIndexRetriever` a legjobb-k legösszetettebb node-okat fogja lekérni. Eközben egy `SummaryIndexRetriever` minden node-ot le fog kérni, függetlenül a lekérdezéstől.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// Node-ok lekérése!
const nodesWithScore = await retriever.retrieve("lekérdezési karakterlánc");
```

## API Referencia

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)

"
