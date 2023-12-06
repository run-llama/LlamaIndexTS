---
sidebar_position: 1
---

# Beágyazás

`Ezt a dokumentációt automatikusan fordították le, és tartalmazhat hibákat. Ne habozzon nyitni egy Pull Requestet a változtatások javasolására.`

A beágyazási modell a LlamaIndexben felelős a szöveg numerikus reprezentációinak létrehozásáért. Alapértelmezetten a LlamaIndex a `text-embedding-ada-002` modellt használja az OpenAI-tól.

Ezt explicit módon beállíthatjuk a `ServiceContext` objektumban.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## API Referencia

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
