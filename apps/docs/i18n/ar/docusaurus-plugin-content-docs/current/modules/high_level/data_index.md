---
sidebar_position: 2
---

# الفهرس

`تمت ترجمة هذه الوثيقة تلقائيًا وقد تحتوي على أخطاء. لا تتردد في فتح طلب سحب لاقتراح تغييرات.`

الفهرس هو الحاوية الأساسية والتنظيم لبياناتك. يدعم LlamaIndex.TS نوعين من الفهارس:

- `VectorStoreIndex` - سيقوم بإرسال أعلى `Node` الموجودة إلى LLM عند إنشاء استجابة. القيمة الافتراضية لأعلى `k` هي 2.
- `SummaryIndex` - سيقوم بإرسال كل `Node` في الفهرس إلى LLM لإنشاء استجابة.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "اختبار" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## مرجع الواجهة البرمجية

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
