---
sidebar_position: 1
---

# تضمين

`تمت ترجمة هذه الوثيقة تلقائيًا وقد تحتوي على أخطاء. لا تتردد في فتح طلب سحب لاقتراح تغييرات.`

يتولى النموذج المضمن في LlamaIndex إنشاء تمثيلات رقمية للنص. بشكل افتراضي ، ستستخدم LlamaIndex نموذج `text-embedding-ada-002` من OpenAI.

يمكن تعيين ذلك بشكل صريح في كائن `ServiceContext`.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## مرجع الواجهة البرمجية

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
