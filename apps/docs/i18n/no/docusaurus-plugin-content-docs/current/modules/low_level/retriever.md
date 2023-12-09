---
sidebar_position: 5
---

# Retriever (Henter)

`Denne dokumentasjonen har blitt automatisk oversatt og kan inneholde feil. Ikke nøl med å åpne en Pull Request for å foreslå endringer.`

En retriever i LlamaIndex er det som brukes for å hente `Node`-er fra en indeks ved hjelp av en spørringsstreng. En `VectorIndexRetriever` vil hente de mest lignende nodene i topp-k resultatene. I mellomtiden vil en `SummaryIndexRetriever` hente alle nodene uavhengig av spørringen.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// Hent noder!
const nodesWithScore = await retriever.retrieve("spørringsstreng");
```

## API-referanse

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)

"
