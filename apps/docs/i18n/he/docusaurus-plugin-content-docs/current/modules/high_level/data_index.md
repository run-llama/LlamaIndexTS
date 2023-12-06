---
sidebar_position: 2
---

# אינדקס

`התיעוד הזה תורגם באופן אוטומטי ועשוי להכיל טעויות. אל תהסס לפתוח בקשת משיכה כדי להציע שינויים.`

אינדקס הוא המיכל הבסיסי והארגון של הנתונים שלך. LlamaIndex.TS תומך בשני אינדקסים:

- `VectorStoreIndex` - ישלח את ה-`Node` הכי גבוהים-k ל-LLM בעת יצירת תגובה. ברירת המחדל של top-k היא 2.
- `SummaryIndex` - ישלח כל `Node` באינדקס ל-LLM כדי ליצור תגובה

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## מדריך לממשק API

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
