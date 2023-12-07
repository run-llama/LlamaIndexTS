---
sidebar_position: 1
---

# Įterpimas

`Ši dokumentacija buvo automatiškai išversta ir gali turėti klaidų. Nedvejodami atidarykite Pull Request, jei norite pasiūlyti pakeitimus.`

Įterpimo modelis LlamaIndex atsakingas už teksto skaitinės reprezentacijos kūrimą. Pagal numatytuosius nustatymus, LlamaIndex naudos `text-embedding-ada-002` modelį iš OpenAI.

Tai gali būti aiškiai nustatyta `ServiceContext` objekte.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## API nuorodos

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
