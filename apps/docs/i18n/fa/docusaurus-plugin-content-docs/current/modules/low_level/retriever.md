---
sidebar_position: 5
---

`این مستند به طور خودکار ترجمه شده و ممکن است حاوی اشتباهات باشد. در صورت پیشنهاد تغییرات، دریغ نکنید از باز کردن یک Pull Request.`

# بازیابی کننده

در LlamaIndex، بازیابی کننده مورد استفاده برای بازیابی گره ها از یک فهرست با استفاده از رشته پرس و جو است. بازیابی کننده `VectorIndexRetriever` گره های مشابه برتر-k را بازیابی می کند. در عین حال، بازیابی کننده `SummaryIndexRetriever` تمام گره ها را بدون توجه به پرس و جو بازیابی می کند.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// بازیابی گره ها!
const nodesWithScore = await retriever.retrieve("رشته پرس و جو");
```

## مرجع API

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)
