---
sidebar_position: 3
---

# موتور پرس و جو (QueryEngine)

`undefined`

موتور پرس و جو یک `Retriever` و یک `ResponseSynthesizer` را در یک لوله قرار می دهد که از رشته پرس و جو برای دریافت گره ها استفاده می کند و سپس آنها را به LLM ارسال می کند تا پاسخی تولید کند.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("رشته پرس و جو");
```

## موتور پرس و جو سوال فرعی (Sub Question Query Engine)

مفهوم اساسی موتور پرس و جو سوال فرعی این است که یک پرس و جوی تک را به چندین پرس و جو تقسیم کند، برای هر یک از این پرس و جوها یک پاسخ دریافت کند و سپس این پاسخ های مختلف را به یک پاسخ یکپارچه برای کاربر ترکیب کند. می توانید به آن به عنوان تکنیک "تفکر مرحله به مرحله" برای پردازش منابع داده خود فکر کنید!

### شروع کردن

آسان ترین راه برای شروع تست موتور پرس و جو سوال فرعی اجرای فایل subquestion.ts در [examples](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts) است.

```bash
npx ts-node subquestion.ts
```

"

### ابزارها

موتور پرس و جو سوال فرعی با استفاده از ابزارها پیاده سازی شده است. ایده اصلی ابزارها این است که آنها گزینه های قابل اجرا برای مدل زبان بزرگ هستند. در این حالت، موتور پرس و جو سوال فرعی ما بر ابزار QueryEngineTool تکیه می کند، که همانطور که حدس زدید، یک ابزار برای اجرای پرس و جوها در یک موتور پرس و جو است. این به ما امکان می دهد تا به مدل یک گزینه بدهیم تا برای سوالات مختلف از اسناد مختلف پرس و جو کند. همچنین می توانید تصور کنید که موتور پرس و جو سوال فرعی می تواند از یک ابزار استفاده کند که برای جستجوی چیزی در وب یا دریافت پاسخی با استفاده از Wolfram Alpha طراحی شده است.

برای کسب اطلاعات بیشتر در مورد ابزارها، به مستندات پایتون LlamaIndex مراجعه کنید: https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## مرجع API

- [موتور پرس و جو بازیابی کننده (RetrieverQueryEngine)](../../api/classes/RetrieverQueryEngine.md)
- [موتور پرس و جو زیرسوال (SubQuestionQueryEngine)](../../api/classes/SubQuestionQueryEngine.md)
- [ابزار موتور پرس و جو (QueryEngineTool)](../../api/interfaces/QueryEngineTool.md)
