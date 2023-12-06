---
sidebar_position: 5
---

# Retriever (Recuperador)

`Esta documentação foi traduzida automaticamente e pode conter erros. Não hesite em abrir um Pull Request para sugerir alterações.`

Um recuperador no LlamaIndex é o que é usado para buscar `Node`s de um índice usando uma string de consulta. Um `VectorIndexRetriever` buscará os nós mais similares ao top-k. Enquanto isso, um `SummaryIndexRetriever` buscará todos os nós, independentemente da consulta.

```typescript
const recuperador = vector_index.asRetriever();
recuperador.similarityTopK = 3;

// Buscar nós!
const nósComPontuação = await recuperador.retrieve("string de consulta");
```

## Referência da API

- [SummaryIndexRetriever (Recuperador de Índice de Resumo)](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever (Recuperador de Índice de Resumo LLM)](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever (Recuperador de Índice Vetorial)](../../api/classes/VectorIndexRetriever.md)
