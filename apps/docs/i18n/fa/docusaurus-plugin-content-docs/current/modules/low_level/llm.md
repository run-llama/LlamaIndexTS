---
sidebar_position: 0
---

# LLM

`undefined`

LLM مسئول خواندن متن و تولید پاسخ های زبان طبیعی به پرسش ها است. به طور پیش فرض، LlamaIndex.TS از `gpt-3.5-turbo` استفاده می کند.

LLM می تواند به صورت صریح در شی `ServiceContext` تنظیم شود.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## مرجع API

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
