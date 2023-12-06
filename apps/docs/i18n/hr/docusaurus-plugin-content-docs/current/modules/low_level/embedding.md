---
sidebar_position: 1
---

# Ugradnja

`Ova dokumentacija je automatski prevedena i može sadržavati greške. Ne ustručavajte se otvoriti Pull Request za predlaganje promjena.`

Model ugradnje u LlamaIndexu odgovoran je za stvaranje numeričkih reprezentacija teksta. Prema zadanim postavkama, LlamaIndex će koristiti model `text-embedding-ada-002` iz OpenAI-a.

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
