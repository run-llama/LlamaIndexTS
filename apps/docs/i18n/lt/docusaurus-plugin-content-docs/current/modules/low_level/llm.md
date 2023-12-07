---
sidebar_position: 0
---

# LLM

`Ši dokumentacija buvo automatiškai išversta ir gali turėti klaidų. Nedvejodami atidarykite Pull Request, jei norite pasiūlyti pakeitimus.`

LLM yra atsakingas už teksto skaitymą ir natūralių kalbos atsakymų generavimą į užklausas. Pagal numatytuosius nustatymus, LlamaIndex.TS naudoja `gpt-3.5-turbo`.

LLM gali būti aiškiai nustatytas `ServiceContext` objekte.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## API Nuorodos

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
