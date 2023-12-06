---
sidebar_position: 0
---

# LLM

`تمت ترجمة هذه الوثيقة تلقائيًا وقد تحتوي على أخطاء. لا تتردد في فتح طلب سحب لاقتراح تغييرات.`

يتولى LLM قراءة النص وتوليد استجابات لغوية طبيعية للاستفسارات. بشكل افتراضي ، يستخدم LlamaIndex.TS `gpt-3.5-turbo`.

يمكن تعيين LLM بشكل صريح في كائن `ServiceContext`.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## مرجع الواجهة البرمجية

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
