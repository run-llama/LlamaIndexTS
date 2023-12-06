---
sidebar_position: 3
---

# NodeParser (محلل العقدة)

`تمت ترجمة هذه الوثيقة تلقائيًا وقد تحتوي على أخطاء. لا تتردد في فتح طلب سحب لاقتراح تغييرات.`

`NodeParser` في LlamaIndex مسؤول عن تقسيم كائنات `Document` إلى كائنات `Node` أكثر إدارة. عند استدعاء `.fromDocuments()`, يتم استخدام `NodeParser` من `ServiceContext` للقيام بذلك تلقائيًا بالنسبة لك. بدلاً من ذلك ، يمكنك استخدامه لتقسيم المستندات مسبقًا.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "أنا عمري 10 سنوات. جون عمره 20 سنة." }),
]);
```

## TextSplitter (مقسم النص)

سيقوم مقسم النص الأساسي بتقسيم النص إلى جمل. يمكن أيضًا استخدامه كوحدة مستقلة لتقسيم النص الخام.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("مرحبًا بالعالم");
```

## مرجع الواجهة البرمجية

- [SimpleNodeParser (محلل العقدة البسيط)](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter (مقسم الجمل)](../../api/classes/SentenceSplitter.md)

"
