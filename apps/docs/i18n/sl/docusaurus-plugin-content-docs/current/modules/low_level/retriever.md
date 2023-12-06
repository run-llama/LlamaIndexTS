---
sidebar_position: 5
---

# Retriever (Získavač)

`Táto dokumentácia bola automaticky preložená a môže obsahovať chyby. Neváhajte otvoriť Pull Request na navrhnutie zmien.`

V LlamaIndexu je získavač (retriever) používaný na získanie uzlov (`Node`) z indexu pomocou reťazca dotazu. `VectorIndexRetriever` získa najpodobnejšie uzly na základe k najvyššieho skóre. Na druhej strane, `SummaryIndexRetriever` získa všetky uzly bez ohľadu na dotaz.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// Získajte uzly!
const nodesWithScore = await retriever.retrieve("reťazec dotazu");
```

## API Referencia

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)

"
