---
sidebar_position: 1
---

# Einbetten

`Diese Dokumentation wurde automatisch übersetzt und kann Fehler enthalten. Zögern Sie nicht, einen Pull Request zu öffnen, um Änderungen vorzuschlagen.`

Das Einbettungsmodell in LlamaIndex ist dafür verantwortlich, numerische Darstellungen von Text zu erstellen. Standardmäßig verwendet LlamaIndex das Modell `text-embedding-ada-002` von OpenAI.

Dies kann explizit im `ServiceContext`-Objekt festgelegt werden.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## API-Referenz

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
