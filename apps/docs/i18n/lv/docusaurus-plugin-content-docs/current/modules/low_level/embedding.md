---
sidebar_position: 1
---

# Iegult

`Šis dokuments ir automātiski tulkots un var saturēt kļūdas. Nevilciniet atvērt Pull Request, lai ierosinātu izmaiņas.`

Iegultā modelis LlamaIndex ir atbildīgs par teksta numeriskās reprezentācijas veidošanu. Pēc noklusējuma LlamaIndex izmantos `text-embedding-ada-002` modeli no OpenAI.

To var skaidri iestatīt `ServiceContext` objektā.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## API Atsauce

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
