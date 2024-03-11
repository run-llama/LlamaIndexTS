---
sidebar_position: 4
---

# תומך בשיחה (ChatEngine)

`התיעוד הזה תורגם באופן אוטומטי ועשוי להכיל טעויות. אל תהסס לפתוח בקשת משיכה כדי להציע שינויים.`

תומך בשיחה הוא דרך מהירה ופשוטה לשוחח עם הנתונים באינדקס שלך.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// התחל לשוחח
const response = await chatEngine.chat(query);
```

## מדריך לממשק תכנות (API)

- [תומך בשיחה עם הקשר (ContextChatEngine)](../../api/classes/ContextChatEngine.md)
- [תומך בשיחה עם שאלה מקוצרת (CondenseQuestionChatEngine)](../../api/classes/ContextChatEngine.md)
