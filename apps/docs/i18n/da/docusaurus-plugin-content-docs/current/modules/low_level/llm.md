---
sidebar_position: 0
---

# LLM

`Denne dokumentation er blevet automatisk oversat og kan indeholde fejl. Tøv ikke med at åbne en Pull Request for at foreslå ændringer.`

LLM er ansvarlig for at læse tekst og generere naturlige sprogsvare på forespørgsler. Som standard bruger LlamaIndex.TS `gpt-3.5-turbo`.

LLM kan eksplicit sættes i `ServiceContext` objektet.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## API Reference

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
