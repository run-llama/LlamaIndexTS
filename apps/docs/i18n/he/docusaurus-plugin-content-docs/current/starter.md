---
sidebar_position: 2
---

# מדריך למתחילים

`התיעוד הזה תורגם באופן אוטומטי ועשוי להכיל טעויות. אל תהסס לפתוח בקשת משיכה כדי להציע שינויים.`

לאחר שהתקנת את LlamaIndex.TS באמצעות NPM והגדרת את מפתח ה-OpenAI שלך, אתה מוכן להתחיל את האפליקציה הראשונה שלך:

בתיקייה חדשה:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # אם נדרש
```

צור את הקובץ `example.ts`. קוד זה יטען נתוני דוגמה, יצור מסמך, יבצע אינדקס (שיצירת embeddings באמצעות OpenAI) ויצור מנוע שאילתות כדי לענות על שאלות על הנתונים.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // טען את המאמר מתוך abramov.txt ב-Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // צור אובייקט Document עם המאמר
  const document = new Document({ text: essay });

  // פצל את הטקסט וצור embeddings. שמור אותם ב-VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // שאילתה לאינדקס
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query("מה עשה המחבר בזמן הקולג'?");

  // הצג תשובה
  console.log(response.toString());
}

main();
```

אז תוכל להריץ את זה באמצעות

```bash
npx ts-node example.ts
```

מוכן ללמוד עוד? בדוק את הגינה שלנו של NextJS בכתובת https://llama-playground.vercel.app/. המקור זמין בכתובת https://github.com/run-llama/ts-playground

"
