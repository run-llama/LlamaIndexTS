---
sidebar_position: 1
---

# Вбудовування

`Ця документація була автоматично перекладена і може містити помилки. Не соромтеся відкривати Pull Request, щоб запропонувати зміни.`

Модель вбудовування в LlamaIndex відповідає за створення числових представлень тексту. За замовчуванням, LlamaIndex використовує модель `text-embedding-ada-002` від OpenAI.

Це можна явно встановити в об'єкті `ServiceContext`.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## Довідник по API

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
