---
sidebar_position: 5
---

# Pretraživač

`Ova dokumentacija je automatski prevedena i može sadržati greške. Ne oklevajte da otvorite Pull Request za predlaganje izmena.`

Pretraživač u LlamaIndex-u se koristi za dohvatanje `Node`-ova iz indeksa koristeći upitni niz. `VectorIndexRetriever` će dohvatiti prvih k najsličnijih čvorova. S druge strane, `SummaryIndexRetriever` će dohvatiti sve čvorove bez obzira na upit.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// Dohvati čvorove!
const nodesWithScore = await retriever.retrieve("upitni niz");
```

## API Referenca

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)

"
