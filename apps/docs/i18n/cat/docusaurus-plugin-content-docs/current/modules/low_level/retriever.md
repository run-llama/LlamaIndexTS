---
sidebar_position: 5
---

# Retriever (Recuperador)

`Aquesta documentació s'ha traduït automàticament i pot contenir errors. No dubteu a obrir una Pull Request per suggerir canvis.`

Un recuperador a LlamaIndex és el que s'utilitza per obtenir `Node`s d'un índex utilitzant una cadena de consulta. Un `VectorIndexRetriever` obtindrà els nodes més similars al top-k. Mentrestant, un `SummaryIndexRetriever` obtindrà tots els nodes, independentment de la consulta.

```typescript
const recuperador = vector_index.asRetriever();
recuperador.similarityTopK = 3;

// Obteniu els nodes!
const nodesAmbPuntuació = await recuperador.retrieve("cadena de consulta");
```

## Referència de l'API

- [SummaryIndexRetriever (Recuperador d'índex de resum)](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever (Recuperador d'índex de resum LLM)](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever (Recuperador d'índex de vectors)](../../api/classes/VectorIndexRetriever.md)
