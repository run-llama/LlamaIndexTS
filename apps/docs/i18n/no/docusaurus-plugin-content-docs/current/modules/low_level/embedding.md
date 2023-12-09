---
sidebar_position: 1
---

# Innbygging

`Denne dokumentasjonen har blitt automatisk oversatt og kan inneholde feil. Ikke nøl med å åpne en Pull Request for å foreslå endringer.`

Innbyggingsmodellen i LlamaIndex er ansvarlig for å opprette numeriske representasjoner av tekst. Som standard vil LlamaIndex bruke modellen `text-embedding-ada-002` fra OpenAI.

Dette kan eksplisitt settes i `ServiceContext`-objektet.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## API-referanse

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
