---
sidebar_position: 1
---

# Indlejring

`Denne dokumentation er blevet automatisk oversat og kan indeholde fejl. Tøv ikke med at åbne en Pull Request for at foreslå ændringer.`

Indlejringmodellen i LlamaIndex er ansvarlig for at skabe numeriske repræsentationer af tekst. Som standard vil LlamaIndex bruge modellen `text-embedding-ada-002` fra OpenAI.

Dette kan eksplicit sættes i `ServiceContext`-objektet.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## API Reference

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
