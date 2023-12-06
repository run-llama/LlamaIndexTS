---
sidebar_position: 5
---

# Retriever (Відновлювач)

`Ця документація була автоматично перекладена і може містити помилки. Не соромтеся відкривати Pull Request, щоб запропонувати зміни.`

Відновлювач в LlamaIndex - це те, що використовується для отримання вузлів (`Node`) з індексу за допомогою рядка запиту. `VectorIndexRetriever` отримує k найбільш схожих вузлів. Тим часом, `SummaryIndexRetriever` отримує всі вузли, незалежно від запиту.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// Отримати вузли!
const nodesWithScore = await retriever.retrieve("рядок запиту");
```

## Довідник API

- [SummaryIndexRetriever (ВідновлювачSummaryIndex)](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever (ВідновлювачSummaryIndexLLM)](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever (ВідновлювачVectorIndex)](../../api/classes/VectorIndexRetriever.md)
