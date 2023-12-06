---
sidebar_position: 0
---

# LLM

`Bu belge otomatik olarak çevrilmiştir ve hatalar içerebilir. Değişiklik önermek için bir Pull Request açmaktan çekinmeyin.`

LLM, metinleri okuma ve sorgulara doğal dil yanıtları üretme işlemlerinden sorumludur. Varsayılan olarak, LlamaIndex.TS `gpt-3.5-turbo` kullanır.

LLM, açıkça `ServiceContext` nesnesinde ayarlanabilir.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## API Referansı

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
