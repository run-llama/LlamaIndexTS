---
sidebar_position: 2
---

# دليل البداية

`تمت ترجمة هذه الوثيقة تلقائيًا وقد تحتوي على أخطاء. لا تتردد في فتح طلب سحب لاقتراح تغييرات.`

بمجرد [تثبيت LlamaIndex.TS باستخدام NPM](installation) وإعداد مفتاح OpenAI الخاص بك، أنت الآن جاهز لبدء تطبيقك الأول:

في مجلد جديد:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # إذا لزم الأمر
```

أنشئ ملف `example.ts`. سيقوم هذا الكود بتحميل بعض البيانات المثالية، وإنشاء وثيقة، وفهرسة الوثيقة (مما ينشئ تضمينات باستخدام OpenAI)، ثم إنشاء محرك الاستعلام للإجابة على الأسئلة حول البيانات.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // تحميل المقالة من abramov.txt في Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // إنشاء كائن Document بواسطة المقالة
  const document = new Document({ text: essay });

  // تقسيم النص وإنشاء التضمينات. تخزينها في VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // استعلام الفهرس
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query("ماذا فعل الكاتب في الكلية؟");

  // إخراج الاستجابة
  console.log(response.toString());
}

main();
```

ثم يمكنك تشغيله باستخدام

```bash
npx ts-node example.ts
```

هل أنت مستعد للمزيد من التعلم؟ تفضل بزيارة منصة NextJS الخاصة بنا على https://llama-playground.vercel.app/. يمكنك العثور على المصدر على https://github.com/run-llama/ts-playground

"
