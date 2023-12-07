---
sidebar_position: 5
---

# Retriever (Извличател)

`Тази документация е преведена автоматично и може да съдържа грешки. Не се колебайте да отворите Pull Request, за да предложите промени.`

Извличател в LlamaIndex е това, което се използва за извличане на `Node` от индекс чрез заявка. `VectorIndexRetriever` ще извлече най-подобните k върха. В същото време, `SummaryIndexRetriever` ще извлече всички върхове, независимо от заявката.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// Извличане на върхове!
const nodesWithScore = await retriever.retrieve("query string");
```

## API Reference (API справка)

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)

"
