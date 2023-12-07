---
sidebar_position: 3
---

# NodeParser (מנתח צומת)

`התיעוד הזה תורגם באופן אוטומטי ועשוי להכיל טעויות. אל תהסס לפתוח בקשת משיכה כדי להציע שינויים.`

ה-`NodeParser` ב-LlamaIndex אחראי לחלק את אובייקטי ה-`Document` לתתי אובייקטים נוספים וניהוליים יותר של צמתים (`Node`). כאשר אתה קורא ל-`.fromDocuments()`, ה-`NodeParser` מתוך ה-`ServiceContext` משמש לעשות זאת באופן אוטומטי עבורך. בנוסף, תוכל להשתמש בו כדי לחלק את המסמכים מראש.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "אני בן 10. ג'ון בן 20." }),
]);
```

## TextSplitter (מפצל הטקסט)

מפצל הטקסט הבסיסי מפצל את הטקסט לפי משפטים. ניתן גם להשתמש בו כמודול עצמאי לפיצול טקסט גולמי.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("שלום עולם");
```

## מדריך לממשק API

- [SimpleNodeParser (מנתח צומת פשוט)](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter (מפצל משפטים)](../../api/classes/SentenceSplitter.md)

"
