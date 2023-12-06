---
sidebar_position: 0
---

# LLM

`Ta dokumentacija je bila samodejno prevedena in lahko vsebuje napake. Ne oklevajte odpreti Pull Request za predlaganje sprememb.`

LLM je odgovoren za branje besedila in ustvarjanje naravnih jezikovnih odgovorov na poizvedbe. Privzeto LlamaIndex.TS uporablja `gpt-3.5-turbo`.

LLM lahko eksplicitno nastavimo v objektu `ServiceContext`.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## API Referenca

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
