---
sidebar_position: 0
---

# LLM

`Aquesta documentació s'ha traduït automàticament i pot contenir errors. No dubteu a obrir una Pull Request per suggerir canvis.`

El LLM és responsable de llegir text i generar respostes en llenguatge natural a les consultes. Per defecte, LlamaIndex.TS utilitza `gpt-3.5-turbo`.

El LLM es pot establir explícitament a l'objecte `ServiceContext`.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## Referència de l'API

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
