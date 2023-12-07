---
sidebar_position: 5
---

# الباحث (Retriever)

`تمت ترجمة هذه الوثيقة تلقائيًا وقد تحتوي على أخطاء. لا تتردد في فتح طلب سحب لاقتراح تغييرات.`

الباحث في LlamaIndex هو ما يُستخدم لاسترداد العقد (`Node`) من فهرس باستخدام سلسلة الاستعلام. سيقوم الباحث `VectorIndexRetriever` بجلب أعلى k عقد مشابهة. بينما سيقوم الباحث `SummaryIndexRetriever` بجلب جميع العقد بغض النظر عن الاستعلام.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// جلب العقد!
const nodesWithScore = await retriever.retrieve("سلسلة الاستعلام");
```

## مرجع الواجهة البرمجية (API Reference)

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)
