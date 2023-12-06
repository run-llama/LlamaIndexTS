---
sidebar_position: 1
---

# Встраивание (Embedding)

`Эта документация была автоматически переведена и может содержать ошибки. Не стесняйтесь открывать Pull Request для предложения изменений.`

Модель встраивания в LlamaIndex отвечает за создание числовых представлений текста. По умолчанию LlamaIndex будет использовать модель `text-embedding-ada-002` от OpenAI.

Это можно явно установить в объекте `ServiceContext`.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## Справочник по API

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
