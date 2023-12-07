---
sidebar_position: 6
---

# مركب الاستجابة (ResponseSynthesizer)

`تمت ترجمة هذه الوثيقة تلقائيًا وقد تحتوي على أخطاء. لا تتردد في فتح طلب سحب لاقتراح تغييرات.`

مركب الاستجابة (ResponseSynthesizer) مسؤول عن إرسال الاستعلام والعقد وقوالب الاستفسار إلى LLM لتوليد استجابة. هناك بعض وسائط رئيسية لتوليد استجابة:

- `تحسين`: "إنشاء وتحسين" إجابة عن طريق المرور تتاليًا عبر كل قطعة نص مُسترجعة. يتم إجراء استدعاء LLM منفصل لكل عقدة. جيد للإجابات المفصلة.
- `مضغوط وتحسين` (الافتراضي): "ضغط" الاستفسار أثناء كل استدعاء LLM عن طريق حشو أكبر عدد ممكن من قطع النص التي يمكن أن تتناسب مع حجم الاستفسار الأقصى. إذا كان هناك الكثير من القطع لتعبئتها في استفسار واحد، "إنشاء وتحسين" إجابة عن طريق المرور بعدة استفسارات مضغوطة. نفس العملية كـ `تحسين`، ولكن يجب أن تؤدي إلى مزيد من استدعاءات LLM أقل.
- `ملخص الشجرة`: بناء شجرة بشكل متكرر بناءً على مجموعة من قطع النص والاستعلام، وإرجاع العقدة الجذرية كاستجابة. جيد لأغراض التلخيص.
- `منشئ الاستجابة البسيط`: تطبيق الاستعلام على كل قطعة نص وتجميع الاستجابات في مصفوفة. يعيد سلسلة متصلة من جميع الاستجابات. جيد عندما تحتاج إلى تشغيل نفس الاستعلام بشكل منفصل على كل قطعة نص.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "أنا عمري 10 سنوات." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "جون عمره 20 سنة." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "ما هو عمري؟",
  nodesWithScore,
);
console.log(response.response);
```

## مرجع الواجهة البرمجية

- [مركب الاستجابة (ResponseSynthesizer)](../../api/classes/ResponseSynthesizer.md)
- [تحسين (Refine)](../../api/classes/Refine.md)
- [مضغوط وتحسين (CompactAndRefine)](../../api/classes/CompactAndRefine.md)
- [ملخص الشجرة (TreeSummarize)](../../api/classes/TreeSummarize.md)
- [منشئ الاستجابة البسيط (SimpleResponseBuilder)](../../api/classes/SimpleResponseBuilder.md)
