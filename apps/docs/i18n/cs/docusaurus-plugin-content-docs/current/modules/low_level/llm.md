---
sidebar_position: 0
---

# LLM

`Tato dokumentace byla automaticky přeložena a může obsahovat chyby. Neváhejte otevřít Pull Request pro navrhování změn.`

LLM je zodpovědný za čtení textu a generování přirozených jazykových odpovědí na dotazy. Výchozím modelem pro LlamaIndex.TS je `gpt-3.5-turbo`.

LLM lze explicitně nastavit v objektu `ServiceContext`.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## API Reference

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
