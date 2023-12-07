---
sidebar_position: 1
---

# Osadzanie

`Ta dokumentacja została przetłumaczona automatycznie i może zawierać błędy. Nie wahaj się otworzyć Pull Request, aby zaproponować zmiany.`

Model osadzania w LlamaIndex jest odpowiedzialny za tworzenie numerycznych reprezentacji tekstu. Domyślnie LlamaIndex będzie używał modelu `text-embedding-ada-002` z OpenAI.

Można to jawnie ustawić w obiekcie `ServiceContext`.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## Dokumentacja interfejsu API

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
