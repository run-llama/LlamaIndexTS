---
sidebar_position: 0
---

# LLM (Мовний модуль)

`Ця документація була автоматично перекладена і може містити помилки. Не соромтеся відкривати Pull Request, щоб запропонувати зміни.`

Мовний модуль (LLM) відповідає за читання тексту та генерацію природних мовних відповідей на запити. За замовчуванням, LlamaIndex.TS використовує `gpt-3.5-turbo`.

LLM можна явно встановити в об'єкті `ServiceContext`.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## Довідка по API

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
