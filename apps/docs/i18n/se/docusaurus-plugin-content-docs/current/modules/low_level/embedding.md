---
sidebar_position: 1
---

# Ugrađivanje

`Ova dokumentacija je automatski prevedena i može sadržati greške. Ne oklevajte da otvorite Pull Request za predlaganje izmena.`

Model ugrađivanja u LlamaIndex-u je odgovoran za kreiranje numeričkih reprezentacija teksta. Prema zadanim postavkama, LlamaIndex će koristiti model `text-embedding-ada-002` iz OpenAI-a.

Ovo se može eksplicitno postaviti u objektu `ServiceContext`.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## API Referenca

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
