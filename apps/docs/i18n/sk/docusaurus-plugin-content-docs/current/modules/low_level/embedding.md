---
sidebar_position: 1
---

# Vdelava

`Ta dokumentacija je bila samodejno prevedena in lahko vsebuje napake. Ne oklevajte odpreti Pull Request za predlaganje sprememb.`

Model vdelave v LlamaIndexu je odgovoren za ustvarjanje numeričnih predstav besedila. Privzeto bo LlamaIndex uporabil model `text-embedding-ada-002` iz OpenAI.

To lahko eksplicitno nastavite v objektu `ServiceContext`.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## API Sklic

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
