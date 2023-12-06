---
sidebar_position: 5
---

# Gavėjas (Retriever)

`Ši dokumentacija buvo automatiškai išversta ir gali turėti klaidų. Nedvejodami atidarykite Pull Request, jei norite pasiūlyti pakeitimus.`

Gavėjas LlamaIndex'e yra tai, kas naudojama išgauti `Node`'us iš indekso naudojant užklausos eilutę. `VectorIndexRetriever` išgaus top-k panašiausius mazgus. Tuo tarpu `SummaryIndexRetriever` išgaus visus mazgus, nepriklausomai nuo užklausos.

```typescript
const gavėjas = vector_index.asRetriever();
gavėjas.similarityTopK = 3;

// Išgaunami mazgai!
const mazgaiSuRezultatu = await gavėjas.retrieve("užklausos eilutė");
```

## API nuorodos (API Reference)

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)
