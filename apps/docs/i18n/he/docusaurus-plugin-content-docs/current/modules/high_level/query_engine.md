---
sidebar_position: 3
---

# מנוע שאילתות (QueryEngine)

`התיעוד הזה תורגם באופן אוטומטי ועשוי להכיל טעויות. אל תהסס לפתוח בקשת משיכה כדי להציע שינויים.`

מנוע שאילתות מעטפת את `Retriever` ו-`ResponseSynthesizer` לתוך צינור, שישתמש במחרוזת השאילתא כדי לאחזר צמתים ולשלוח אותם ל-LLM כדי ליצור תשובה.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("מחרוזת שאילתא");
```

## מנוע שאלות משנה (Sub Question Query Engine)

הרעיון הבסיסי של מנוע שאלות משנה הוא לחלק שאילתה יחידה למספר שאילות, לקבל תשובה עבור כל אחת מהשאילות הללו, ולאחד את התשובות השונות הללו לתשובה קוהרנטית אחת עבור המשתמש. ניתן לחשוב על זה כעל טכניקת הצעד-אחר-צעד "חשוב זאת בקפיצים" אבל בעזרת מקורות המידע שלך!

### התחלה מהירה

הדרך הקלה ביותר להתחיל לנסות את מנוע שאילתות שאלה משנה היא להריץ את הקובץ subquestion.ts בתיקיית [דוגמאות](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

"

### כלים

מנוע שאלות משנה מיושם בעזרת כלים. הרעיון הבסיסי של כלים הוא שהם אפשרויות ניתנות לביצוע עבור המודל השפה הגדול. במקרה זה, המנוע שאלות משנה שלנו מתבסס על QueryEngineTool, שכפי שניחשת, הוא כלי להרצת שאילות על מנוע שאילתות. זה מאפשר לנו לתת למודל אפשרות לשאול מסמכים שונים לשאלות שונות לדוגמה. ניתן גם לדמיין שמנוע שאלות משנה יכול להשתמש בכלי שמחפש משהו ברשת או מקבל תשובה באמצעות Wolfram Alpha.

ניתן ללמוד עוד על כלים על ידי הצצה לתיעוד ה-Python של LlamaIndex https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## מדריך לממשק API

- [מנוע שאילתות של Retriever (RetrieverQueryEngine)](../../api/classes/RetrieverQueryEngine.md)
- [מנוע שאלה משנה (SubQuestionQueryEngine)](../../api/classes/SubQuestionQueryEngine.md)
- [כלי מנוע שאילתות (QueryEngineTool)](../../api/interfaces/QueryEngineTool.md)
