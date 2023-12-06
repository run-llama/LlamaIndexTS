---
sidebar_position: 7
---

# אחסון

`התיעוד הזה תורגם באופן אוטומטי ועשוי להכיל טעויות. אל תהסס לפתוח בקשת משיכה כדי להציע שינויים.`

אחסון ב-LlamaIndex.TS עובד באופן אוטומטי לאחר הגדרת אובייקט `StorageContext`. פשוט הגדר את `persistDir` וצרף אותו לאינדקס.

כרגע, נתמך רק שמירה וטעינה מהדיסק, עם אינטגרציות עתידיות מתוכננות!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Test Text" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## מדריך לממשק API

- [StorageContext](../../api/interfaces/StorageContext.md)

"
