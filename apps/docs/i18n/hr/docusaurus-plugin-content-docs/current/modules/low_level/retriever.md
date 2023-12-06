---
sidebar_position: 5
---

# Dohvatnik

`Ova dokumentacija je automatski prevedena i može sadržavati greške. Ne ustručavajte se otvoriti Pull Request za predlaganje promjena.`

Dohvatnik u LlamaIndexu se koristi za dohvaćanje `Node`-ova iz indeksa koristeći upitni niz. `VectorIndexRetriever` će dohvatiti prvih k najsličnijih čvorova. S druge strane, `SummaryIndexRetriever` će dohvatiti sve čvorove bez obzira na upit.

```typescript
const dohvatnik = vector_index.asRetriever();
dohvatnik.similarityTopK = 3;

// Dohvati čvorove!
const čvoroviSaRezultatom = await dohvatnik.retrieve("upitni niz");
```

## API Referenca

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)

"
