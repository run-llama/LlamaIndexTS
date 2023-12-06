---
sidebar_position: 5
---

# Retriever (Taastaja)

`See dokumentatsioon on tõlgitud automaatselt ja võib sisaldada vigu. Ärge kartke avada Pull Request, et pakkuda muudatusi.`

Retriever (Taastaja) LlamaIndexis on see, mida kasutatakse `Node`-de toomiseks indeksist päringu stringi abil. `VectorIndexRetriever` toob kõige sarnasemad sõlmed top-k kujul. Samal ajal toob `SummaryIndexRetriever` kõik sõlmed olenemata päringust.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// Too sõlmed!
const nodesWithScore = await retriever.retrieve("päringu string");
```

## API viide

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)
