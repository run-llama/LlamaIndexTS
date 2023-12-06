---
sidebar_position: 0
---

# LLM (Языковая модель)

`Эта документация была автоматически переведена и может содержать ошибки. Не стесняйтесь открывать Pull Request для предложения изменений.`

LLM отвечает за чтение текста и генерацию естественноязыковых ответов на запросы. По умолчанию LlamaIndex.TS использует `gpt-3.5-turbo`.

LLM можно явно установить в объекте `ServiceContext`.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## Справочник по API

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
