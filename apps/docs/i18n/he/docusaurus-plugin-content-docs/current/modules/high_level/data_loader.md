---
sidebar_position: 1
---

`התיעוד הזה תורגם באופן אוטומטי ועשוי להכיל טעויות. אל תהסס לפתוח בקשת משיכה כדי להציע שינויים.`

# קורא / טוען

LlamaIndex.TS תומך בטעינה קלה של קבצים מתוך תיקיות באמצעות המחלקה `SimpleDirectoryReader`. כרגע, נתמכים קבצים בפורמטים `.txt`, `.pdf`, `.csv`, `.md` ו `.docx`, ותוכנן להוסיף עוד בעתיד!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## מדריך לממשק תכנות (API)

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)
