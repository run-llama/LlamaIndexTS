---
sidebar_position: 1
---

# Intégration

Le modèle d'intégration dans LlamaIndex est responsable de la création de représentations numériques du texte. Par défaut, LlamaIndex utilisera le modèle `text-embedding-ada-002` d'OpenAI.

Cela peut être explicitement défini dans l'objet `ServiceContext`.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## Référence de l'API

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding)
- [ServiceContext](../../api/interfaces/ServiceContext)
