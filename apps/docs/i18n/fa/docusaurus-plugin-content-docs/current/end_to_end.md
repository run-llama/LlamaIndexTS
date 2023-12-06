---
sidebar_position: 4
---

# مثال‌های انتها به انتها

`undefined`

ما چندین مثال انتها به انتها با استفاده از LlamaIndex.TS را در مخزن قرار داده‌ایم.

مثال‌های زیر را بررسی کنید یا آن‌ها را امتحان کنید و در عرض چند دقیقه با آموزش‌های تعاملی Github Codespace ارائه شده توسط Dev-Docs [اینجا](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json) کامل کنید:

## [موتور چت](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

یک فایل را بخوانید و درباره آن با LLM چت کنید.

## [ایندکس برداری](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

یک ایندکس برداری بسازید و آن را جستجو کنید. ایندکس برداری برای بازیابی k گره مرتبط‌تر از طریق تعبیه‌ها استفاده می‌کند. به طور پیش فرض، k برابر 2 است.

"

## [فهرست خلاصه](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

یک فهرست ایجاد کنید و آن را جستجو کنید. این مثال همچنین از `LLMRetriever` استفاده می‌کند که از LLM برای انتخاب بهترین گره‌ها برای استفاده در تولید پاسخ استفاده می‌کند.

"

## [ذخیره / بارگیری یک ایندکس](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

ایجاد و بارگیری یک ایندکس برداری. ذخیره‌سازی در دیسک در LlamaIndex.TS به طور خودکار انجام می‌شود هنگامی که یک شیء متناظر با محیط ذخیره‌سازی ایجاد می‌شود.

"

## [ایندکس بردار سفارشی](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

ایجاد یک ایندکس بردار و استعلام آن را انجام دهید، در عین حال تنظیم کردن `LLM`، `ServiceContext` و `similarity_top_k`.

"

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

یک OpenAI LLM ایجاد کنید و مستقیماً از آن برای چت استفاده کنید.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

یک Llama-2 LLM ایجاد کنید و مستقیماً از آن برای چت استفاده کنید.

"

## [موتور پرسش زیرسوال](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

از `موتور پرسش زیرسوال` استفاده می‌کند که پرسش‌های پیچیده را به چندین سوال کوچک تقسیم کرده و سپس پاسخ را در میان پاسخ‌های همه زیرسوال‌ها تجمیع می‌کند.

"

## [ماژول‌های سطح پایین](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

این مثال از چندین مولفه سطح پایین استفاده می‌کند که نیاز به یک موتور پرس و جو واقعی را برطرف می‌کند. این مولفه‌ها می‌توانند در هر کجا، در هر برنامه‌ای استفاده شوند یا برای برآورده کردن نیازهای خود سفارشی شده و زیرکلاس‌هایی از آن‌ها ایجاد شود.

"
