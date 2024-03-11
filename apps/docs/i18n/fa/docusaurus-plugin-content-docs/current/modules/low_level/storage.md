---
sidebar_position: 7
---

# ذخیره سازی

`undefined`

ذخیره سازی در LlamaIndex.TS به طور خودکار کار می کند، بعد از پیکربندی یک شی `StorageContext`. فقط کافیست `persistDir` را پیکربندی کنید و آن را به یک ایندکس متصل کنید.

در حال حاضر، فقط ذخیره و بارگیری از دیسک پشتیبانی می شود و ادغام های آینده نیز در دست برنامه ریزی است!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "متن آزمایشی" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## مرجع API

- [StorageContext](../../api/interfaces/StorageContext.md)

"
