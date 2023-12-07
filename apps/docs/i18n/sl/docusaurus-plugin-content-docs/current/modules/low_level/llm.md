---
sidebar_position: 0
---

# LLM

`Táto dokumentácia bola automaticky preložená a môže obsahovať chyby. Neváhajte otvoriť Pull Request na navrhnutie zmien.`

LLM je zodpovedný za čítanie textu a generovanie prirodzených jazykových odpovedí na otázky. Východzím modelom pre LlamaIndex.TS je `gpt-3.5-turbo`.

LLM môže byť explicitne nastavený v objekte `ServiceContext`.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## API Referencia

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
