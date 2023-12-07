---
sidebar_position: 1
---

# Incrustació

`Aquesta documentació s'ha traduït automàticament i pot contenir errors. No dubteu a obrir una Pull Request per suggerir canvis.`

El model d'incrustació a LlamaIndex és responsable de crear representacions numèriques de text. Per defecte, LlamaIndex utilitzarà el model `text-embedding-ada-002` de OpenAI.

Això es pot establir explícitament a l'objecte `ServiceContext`.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## Referència de l'API

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
