---
sidebar_position: 0
---

# LLM

`Ova dokumentacija je automatski prevedena i može sadržati greške. Ne oklevajte da otvorite Pull Request za predlaganje izmena.`

LLM je odgovoran za čitanje teksta i generisanje prirodnih jezičkih odgovora na upite. Podrazumevano, LlamaIndex.TS koristi `gpt-3.5-turbo`.

LLM se može eksplicitno postaviti u objektu `ServiceContext`.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## API Referenca

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
