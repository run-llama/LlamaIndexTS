---
sidebar_position: 0
---

# LLM

`See dokumentatsioon on tõlgitud automaatselt ja võib sisaldada vigu. Ärge kartke avada Pull Request, et pakkuda muudatusi.`

LLM vastutab teksti lugemise ja loomuliku keele vastuste genereerimise eest päringutele. Vaikimisi kasutab LlamaIndex.TS `gpt-3.5-turbo`-d.

LLM saab määrata selgelt `ServiceContext` objektis.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## API viide

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
