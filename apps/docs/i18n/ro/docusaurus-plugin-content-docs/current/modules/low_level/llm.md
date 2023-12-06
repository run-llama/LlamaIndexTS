---
sidebar_position: 0
---

# LLM

`Această documentație a fost tradusă automat și poate conține erori. Nu ezitați să deschideți un Pull Request pentru a sugera modificări.`

LLM-ul este responsabil de citirea textului și generarea de răspunsuri în limbaj natural la interogări. În mod implicit, LlamaIndex.TS utilizează `gpt-3.5-turbo`.

LLM-ul poate fi setat explicit în obiectul `ServiceContext`.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## Referință API

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
