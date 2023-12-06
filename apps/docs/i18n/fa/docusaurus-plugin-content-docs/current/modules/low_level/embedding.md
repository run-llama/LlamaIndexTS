---
sidebar_position: 1
---

# تعبیه کردن

`undefined`

مدل تعبیه کردن در LlamaIndex مسئول ایجاد نمایش عددی از متن است. به طور پیش فرض، LlamaIndex از مدل `text-embedding-ada-002` از OpenAI استفاده می کند.

این می تواند به صورت صریح در شی `ServiceContext` تنظیم شود.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## مرجع API

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
