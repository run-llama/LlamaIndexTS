---
sidebar_position: 5
---

# Pridobitelj

`Ta dokumentacija je bila samodejno prevedena in lahko vsebuje napake. Ne oklevajte odpreti Pull Request za predlaganje sprememb.`

Pridobitelj v LlamaIndexu se uporablja za pridobivanje `Node`-ov iz indeksa z uporabo poizvedbenega niza. `VectorIndexRetriever` bo pridobil najbolj podobne vozlišča glede na kriterij k. Medtem pa bo `SummaryIndexRetriever` pridobil vsa vozlišča, ne glede na poizvedbo.

```typescript
const pridobitelj = vector_index.asRetriever();
pridobitelj.similarityTopK = 3;

// Pridobivanje vozlišč!
const vozliščaZRezultatom = await pridobitelj.retrieve("poizvedbeni niz");
```

## API Sklic

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)

"
