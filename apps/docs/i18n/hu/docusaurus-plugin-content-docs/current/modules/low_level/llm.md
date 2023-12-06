---
sidebar_position: 0
---

# LLM

`Ezt a dokumentációt automatikusan fordították le, és tartalmazhat hibákat. Ne habozzon nyitni egy Pull Requestet a változtatások javasolására.`

Az LLM felelős a szöveg olvasásáért és természetes nyelvű válaszok generálásáért a lekérdezésekre. Alapértelmezetten a LlamaIndex.TS a `gpt-3.5-turbo`-t használja.

Az LLM explicit módon beállítható a `ServiceContext` objektumban.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## API Referencia

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
