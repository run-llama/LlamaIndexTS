---
sidebar_position: 5
---

# Retriever (Recuperador)

`Esta documentación ha sido traducida automáticamente y puede contener errores. No dudes en abrir una Pull Request para sugerir cambios.`

Un recuperador en LlamaIndex es lo que se utiliza para obtener `Node`s de un índice utilizando una cadena de consulta. Un `VectorIndexRetriever` obtendrá los nodos más similares a los k mejores. Mientras tanto, un `SummaryIndexRetriever` obtendrá todos los nodos sin importar la consulta.

```typescript
const recuperador = vector_index.asRetriever();
recuperador.similarityTopK = 3;

// ¡Obtener nodos!
const nodosConPuntuación = await recuperador.retrieve("cadena de consulta");
```

## Referencia de la API

- [SummaryIndexRetriever (Recuperador de Índice de Resumen)](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever (Recuperador de Índice de Resumen LLM)](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever (Recuperador de Índice Vectorial)](../../api/classes/VectorIndexRetriever.md)
