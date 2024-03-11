---
sidebar_position: 2
---

# Índice

`Esta documentación ha sido traducida automáticamente y puede contener errores. No dudes en abrir una Pull Request para sugerir cambios.`

Un índice es el contenedor básico y la organización de sus datos. LlamaIndex.TS admite dos tipos de índices:

- `VectorStoreIndex` - enviará los mejores `Node`s al LLM al generar una respuesta. El valor predeterminado de mejores es 2.
- `SummaryIndex` - enviará cada `Node` en el índice al LLM para generar una respuesta.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## Referencia de la API

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)
