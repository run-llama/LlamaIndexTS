---
sidebar_position: 0
---

# LLM

`Tämä dokumentaatio on käännetty automaattisesti ja se saattaa sisältää virheitä. Älä epäröi avata Pull Requestia ehdottaaksesi muutoksia.`

LLM vastaa tekstin lukemisesta ja luonnollisten kielten vastausten tuottamisesta kyselyihin. Oletusarvoisesti LlamaIndex.TS käyttää `gpt-3.5-turbo` -mallia.

LLM voidaan asettaa nimenomaisesti `ServiceContext` -objektissa.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## API-viite

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
