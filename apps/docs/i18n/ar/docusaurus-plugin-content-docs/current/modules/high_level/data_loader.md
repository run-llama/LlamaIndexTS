---
sidebar_position: 1
---

# قارئ / محمل

`تمت ترجمة هذه الوثيقة تلقائيًا وقد تحتوي على أخطاء. لا تتردد في فتح طلب سحب لاقتراح تغييرات.`

يدعم LlamaIndex.TS تحميل الملفات بسهولة من المجلدات باستخدام فئة `SimpleDirectoryReader`. حاليًا ، يتم دعم الملفات `.txt` ، `.pdf` ، `.csv` ، `.md` و `.docx` ، مع المزيد المخطط له في المستقبل!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## مرجع الواجهة البرمجية

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)
