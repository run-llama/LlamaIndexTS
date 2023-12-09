---
sidebar_position: 5
---

# Retriever (Hakija)

`Tämä dokumentaatio on käännetty automaattisesti ja se saattaa sisältää virheitä. Älä epäröi avata Pull Requestia ehdottaaksesi muutoksia.`

Retriever (Hakija) LlamaIndexissä on se, mitä käytetään `Node`jen hakemiseen indeksistä käyttäen kyselymerkkijonoa. `VectorIndexRetriever` hakee k-kpl samankaltaisimpia solmuja. Toisaalta `SummaryIndexRetriever` hakee kaikki solmut riippumatta kyselystä.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// Hae solmut!
const nodesWithScore = await retriever.retrieve("kyselymerkkijono");
```

## API-viite

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)

"
