---
sidebar_position: 0
---

# LLM

`Ova dokumentacija je automatski prevedena i može sadržavati greške. Ne ustručavajte se otvoriti Pull Request za predlaganje promjena.`

LLM je odgovoran za čitanje teksta i generiranje prirodnih jezičnih odgovora na upite. Prema zadanim postavkama, LlamaIndex.TS koristi `gpt-3.5-turbo`.

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
