---
sidebar_position: 0
---

# LLM

`Šis dokuments ir automātiski tulkots un var saturēt kļūdas. Nevilciniet atvērt Pull Request, lai ierosinātu izmaiņas.`

LLM ir atbildīgs par teksta lasīšanu un dabisku valodas atbilžu ģenerēšanu uz vaicājumiem. Pēc noklusējuma, LlamaIndex.TS izmanto `gpt-3.5-turbo`.

LLM var tikt skaidri iestatīts `ServiceContext` objektā.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## API Atsauce

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
