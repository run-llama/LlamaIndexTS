---
sidebar_position: 5
---

# Retriever (Získávač)

`Tato dokumentace byla automaticky přeložena a může obsahovat chyby. Neváhejte otevřít Pull Request pro navrhování změn.`

Získávač (Retriever) v LlamaIndexu je používán k získání uzlů (`Node`) z indexu pomocí dotazovacího řetězce. Získávač `VectorIndexRetriever` získává nejpodobnější uzly s nejvyšším skóre. Zatímco získávač `SummaryIndexRetriever` získává všechny uzly bez ohledu na dotaz.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// Získání uzlů!
const nodesWithScore = await retriever.retrieve("dotazovací řetězec");
```

## API Reference (Odkazy na rozhraní)

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)

"
