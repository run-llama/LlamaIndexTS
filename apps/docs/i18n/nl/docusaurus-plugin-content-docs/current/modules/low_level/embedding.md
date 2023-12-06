---
sidebar_position: 1
---

# Inbedding

`Deze documentatie is automatisch vertaald en kan fouten bevatten. Aarzel niet om een Pull Request te openen om wijzigingen voor te stellen.`

Het inbeddingsmodel in LlamaIndex is verantwoordelijk voor het maken van numerieke representaties van tekst. Standaard zal LlamaIndex het model `text-embedding-ada-002` van OpenAI gebruiken.

Dit kan expliciet worden ingesteld in het `ServiceContext` object.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## API Referentie

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
