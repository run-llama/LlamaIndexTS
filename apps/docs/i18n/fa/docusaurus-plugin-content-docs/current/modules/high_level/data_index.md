---
sidebar_position: 2
---

`این مستند به طور خودکار ترجمه شده و ممکن است حاوی اشتباهات باشد. در صورت پیشنهاد تغییرات، دریغ نکنید از باز کردن یک Pull Request.`

# فهرست

یک فهرست، بستر و سازمان بندی اصلی برای داده های شما است. LlamaIndex.TS دو فهرست را پشتیبانی می کند:

- `VectorStoreIndex` - هنگام تولید پاسخ، بالاترین k `Node` ها را به LLM ارسال می کند. بالاترین k پیش فرض 2 است.
- `SummaryIndex` - هر `Node` را در فهرست به LLM ارسال می کند تا پاسخی تولید شود.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "تست" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## مرجع API

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
