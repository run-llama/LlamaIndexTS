---
sidebar_position: 0
---

# LLM (מנוע שפה טבעית)

`התיעוד הזה תורגם באופן אוטומטי ועשוי להכיל טעויות. אל תהסס לפתוח בקשת משיכה כדי להציע שינויים.`

ה-LLM אחראי לקריאת טקסט ויצירת תגובות בשפה טבעית לשאילתות. כברירת מחדל, LlamaIndex.TS משתמש ב-`gpt-3.5-turbo`.

ניתן להגדיר את ה-LLM באופן ישיר באמצעות אובייקט ה-`ServiceContext`.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## מדריך לממשק API

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
