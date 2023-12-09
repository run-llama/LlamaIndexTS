---
sidebar_position: 2
---

# آموزش مقدماتی

`undefined`

بعد از [نصب LlamaIndex.TS با استفاده از NPM](installation) و تنظیم کردن کلید OpenAI خود، آماده شروع اولین برنامه خود هستید:

در یک پوشه جدید:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # در صورت نیاز
```

فایل `example.ts` را ایجاد کنید. این کد داده های مثالی را بارگیری می کند، یک سند ایجاد می کند، آن را ایندکس می کند (که با استفاده از OpenAI تعبیه ها ایجاد می کند) و سپس یک موتور پرس و جو برای پاسخ به سوالات در مورد داده ها ایجاد می کند.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // از abramov.txt در Node مقاله را بارگیری کنید
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // شیء Document با مقاله ایجاد کنید
  const document = new Document({ text: essay });

  // متن را تقسیم کنید و تعبیه ها را ایجاد کنید. آنها را در یک VectorStoreIndex ذخیره کنید
  const index = await VectorStoreIndex.fromDocuments([document]);

  // به ایندکس پرس و جو کنید
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query(
    "نویسنده در دانشگاه چه کاری انجام داد؟",
  );

  // پاسخ را خروجی دهید
  console.log(response.toString());
}

main();
```

سپس می توانید آن را با استفاده از دستور زیر اجرا کنید

```bash
npx ts-node example.ts
```

آماده برای یادگیری بیشتر هستید؟ به زمین بازی NextJS ما در https://llama-playground.vercel.app/ مراجعه کنید. منبع آن در https://github.com/run-llama/ts-playground در دسترس است.

"
