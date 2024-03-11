---
sidebar_position: 0
---

# LLM

Le LLM est responsable de la lecture du texte et de la génération de réponses en langage naturel aux requêtes. Par défaut, LlamaIndex.TS utilise `gpt-3.5-turbo`.

Le LLM peut être explicitement défini dans l'objet `ServiceContext`.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## Référence de l'API

- [OpenAI](../../api/classes/OpenAI)
- [ServiceContext](../../api/interfaces/ServiceContext)
