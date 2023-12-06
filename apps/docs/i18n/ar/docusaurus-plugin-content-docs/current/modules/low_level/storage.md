---
sidebar_position: 7
---

`تمت ترجمة هذه الوثيقة تلقائيًا وقد تحتوي على أخطاء. لا تتردد في فتح طلب سحب لاقتراح تغييرات.`

# التخزين

يعمل التخزين في LlamaIndex.TS تلقائيًا بمجرد تكوين كائن `StorageContext`. قم بتكوين `persistDir` وربطه بفهرس.

في الوقت الحالي ، يتم دعم حفظ وتحميل البيانات من القرص فقط ، مع وجود تكاملات مستقبلية مخططة!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "نص اختبار" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## مرجع الواجهة البرمجية

- [StorageContext](../../api/interfaces/StorageContext.md)

"
