---
sidebar_position: 6
---

# מסנכרן תגובה (ResponseSynthesizer)

`התיעוד הזה תורגם באופן אוטומטי ועשוי להכיל טעויות. אל תהסס לפתוח בקשת משיכה כדי להציע שינויים.`

המסנכרן תגובה (ResponseSynthesizer) אחראי לשליחת השאילתה, הצמתים ותבניות הפרומפט ל-LLM כדי ליצור תגובה. ישנם כמה מצבים מרכזיים ליצירת תגובה:

- `Refine`: "יצירה ושיפור" של תשובה על ידי עבר סידרתית דרך כל חתיכת טקסט שנמצאה.
  זה עושה שיחת LLM נפרדת לכל צומת. מתאים לתשובות מפורטות יותר.
- `CompactAndRefine` (ברירת מחדל): "כיווץ" הפרומפט במהלך כל שיחת LLM על ידי מילוי כמה חתיכות טקסט שיכנסו בגודל המרבי של הפרומפט. אם יש
  יותר מדי חתיכות למלא בפרומפט אחד, "יצירה ושיפור" של תשובה על ידי עבר דרך
  מספר פרומפטים קומפקטיים. זהה ל-`refine`, אך צריך לגרום לפחות שיחות LLM.
- `TreeSummarize`: בהתבסס על קבוצה של חתיכות טקסט והשאילתה, בנה עץ באופן רקורסיבי
  והחזר את הצומת השורש כתגובה. מתאים לצורך סיכום.
- `SimpleResponseBuilder`: בהתבסס על קבוצה של חתיכות טקסט והשאילתה, החל את השאילתה על כל חתיכת
  טקסט תוך צבירת התגובות למערך. מחזיר מחרוזת מחוברת של כל
  התגובות. מתאים כאשר יש צורך להריץ את אותה שאילתה בנפרד על כל חתיכת
  טקסט.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "אני בן 10 שנים." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "ג'ון בן 20 שנה." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "בן כמה אני?",
  nodesWithScore,
);
console.log(response.response);
```

## מדריך לממשק תכנות (API Reference)

- [מסנכרן תגובה (ResponseSynthesizer)](../../api/classes/ResponseSynthesizer.md)
- [Refine](../../api/classes/Refine.md)
- [CompactAndRefine](../../api/classes/CompactAndRefine.md)
- [TreeSummarize](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder](../../api/classes/SimpleResponseBuilder.md)

"
