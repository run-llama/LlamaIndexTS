---
sidebar_position: 1
---

# Incrustación

`Esta documentación ha sido traducida automáticamente y puede contener errores. No dudes en abrir una Pull Request para sugerir cambios.`

El modelo de incrustación en LlamaIndex es responsable de crear representaciones numéricas de texto. Por defecto, LlamaIndex utilizará el modelo `text-embedding-ada-002` de OpenAI.

Esto se puede establecer explícitamente en el objeto `ServiceContext`.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## Referencia de la API

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
