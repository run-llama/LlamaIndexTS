---
sidebar_position: 0
---

# LLM (Lenguaje y Generación de Respuestas)

`Esta documentación ha sido traducida automáticamente y puede contener errores. No dudes en abrir una Pull Request para sugerir cambios.`

El LLM es responsable de leer texto y generar respuestas en lenguaje natural a consultas. Por defecto, LlamaIndex.TS utiliza `gpt-3.5-turbo`.

El LLM se puede establecer explícitamente en el objeto `ServiceContext`.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## Referencia de la API

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
