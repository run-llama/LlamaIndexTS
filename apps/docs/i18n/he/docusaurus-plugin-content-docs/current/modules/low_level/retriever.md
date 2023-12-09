---
sidebar_position: 5
---

# רטריבר

`התיעוד הזה תורגם באופן אוטומטי ועשוי להכיל טעויות. אל תהסס לפתוח בקשת משיכה כדי להציע שינויים.`

רטריבר ב- LlamaIndex הוא מה שמשמש לאחזור `Node` מאינדקס באמצעות מחרוזת שאילתה. רטריבר מסוג `VectorIndexRetriever` יחזיר את ה- k הכי דומים לצמתים. בינתיים, רטריבר מסוג `SummaryIndexRetriever` יחזיר את כל הצמתים ללא קשר לשאילתה.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// אחזור צמתים!
const nodesWithScore = await retriever.retrieve("מחרוזת שאילתה");
```

## מדריך לממשק API

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)

"
