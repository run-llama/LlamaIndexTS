---
sidebar_position: 0
---

# LLM

`Denne dokumentasjonen har blitt automatisk oversatt og kan inneholde feil. Ikke nøl med å åpne en Pull Request for å foreslå endringer.`

LLM er ansvarlig for å lese tekst og generere naturlige språksvar på spørringer. Som standard bruker LlamaIndex.TS `gpt-3.5-turbo`.

LLM kan eksplisitt settes i `ServiceContext`-objektet.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## API-referanse

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
