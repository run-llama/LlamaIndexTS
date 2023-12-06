---
sidebar_position: 1
---

# הטמעה

`התיעוד הזה תורגם באופן אוטומטי ועשוי להכיל טעויות. אל תהסס לפתוח בקשת משיכה כדי להציע שינויים.`

הדגם המוטמע ב־LlamaIndex אחראי ליצירת ייצוגים מספריים של טקסט. כברירת מחדל, LlamaIndex ישתמש בדגם `text-embedding-ada-002` מ־OpenAI.

ניתן להגדיר זאת באופן מפורש באובייקט `ServiceContext`.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## מדריך לממשק API

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
