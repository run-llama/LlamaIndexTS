---
sidebar_position: 0
---

# LLM

`Questa documentazione è stata tradotta automaticamente e può contenere errori. Non esitare ad aprire una Pull Request per suggerire modifiche.`

LLM è responsabile della lettura del testo e della generazione di risposte in linguaggio naturale alle query. Per impostazione predefinita, LlamaIndex.TS utilizza `gpt-3.5-turbo`.

LLM può essere esplicitamente impostato nell'oggetto `ServiceContext`.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## Riferimento API

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
