---
sidebar_position: 5
---

# Retriever (Recuperator)

`Această documentație a fost tradusă automat și poate conține erori. Nu ezitați să deschideți un Pull Request pentru a sugera modificări.`

Un recuperator în LlamaIndex este ceea ce este folosit pentru a prelua noduri (`Node`) dintr-un index folosind o șir de interogare. Un `VectorIndexRetriever` va prelua primele k noduri cele mai similare. Între timp, un `SummaryIndexRetriever` va prelua toate nodurile indiferent de interogare.

```typescript
const recuperator = vector_index.asRetriever();
recuperator.similarityTopK = 3;

// Preia nodurile!
const noduriCuScor = await recuperator.retrieve("șir de interogare");
```

## Referință API

- [SummaryIndexRetriever (RecuperatorSummaryIndex)](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever (RecuperatorSummaryIndexLLM)](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever (RecuperatorVectorIndex)](../../api/classes/VectorIndexRetriever.md)

"
