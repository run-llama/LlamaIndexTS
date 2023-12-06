---
sidebar_position: 5
---

# Retriever (Pobieracz)

`Ta dokumentacja została przetłumaczona automatycznie i może zawierać błędy. Nie wahaj się otworzyć Pull Request, aby zaproponować zmiany.`

Pobieracz w LlamaIndex służy do pobierania węzłów (`Node`) z indeksu za pomocą ciągu zapytania. Pobieracz `VectorIndexRetriever` pobierze k najbardziej podobnych węzłów. Natomiast pobieracz `SummaryIndexRetriever` pobierze wszystkie węzły bez względu na zapytanie.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// Pobierz węzły!
const nodesWithScore = await retriever.retrieve("ciąg zapytania");
```

## Dokumentacja interfejsu API

- [SummaryIndexRetriever (Pobieracz indeksu podsumowania)](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever (Pobieracz indeksu podsumowania LLM)](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever (Pobieracz indeksu wektorowego)](../../api/classes/VectorIndexRetriever.md)

"
