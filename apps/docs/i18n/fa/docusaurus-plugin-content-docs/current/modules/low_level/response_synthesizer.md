---
sidebar_position: 6
---

# ResponseSynthesizer (ترکیب پاسخ)

`undefined`

ResponseSynthesizer مسئول ارسال پرس و جو، گره ها و الگوهای پیشنهادی به LLM برای تولید یک پاسخ است. چندین حالت کلیدی برای تولید یک پاسخ وجود دارد:

- `Refine` (بهبود): "ایجاد و بهبود" یک پاسخ با پیمایش متوالی هر قطعه متن بازیابی شده. این باعث می شود که برای هر گره یک تماس جداگانه با LLM انجام شود. برای پاسخ های مفصل مناسب است.
- `CompactAndRefine` (پیمایش کوچک و بهبود) (پیش فرض): "فشرده کردن" الگو در هر تماس LLM با پر کردن تعدادی قطعه متن که در حداکثر اندازه الگو جا می شوند. اگر تعداد زیادی قطعه متن برای جاگذاری در یک الگو وجود داشته باشد، "ایجاد و بهبود" یک پاسخ با پیمایش چندین الگوی فشرده انجام می شود. همانطور که `refine` است، اما باید تعداد تماس های کمتری با LLM داشته باشد.
- `TreeSummarize` (خلاصه سازی درختی): با توجه به مجموعه ای از قطعات متن و پرس و جو، به صورت بازگشتی یک درخت ساختاری را تشکیل داده و گره ریشه را به عنوان پاسخ برمی گرداند. برای اهداف خلاصه سازی مناسب است.
- `SimpleResponseBuilder` (سازنده پاسخ ساده): با توجه به مجموعه ای از قطعات متن و پرس و جو، پرس و جو را به هر قطعه متن اعمال کرده و پاسخ ها را در یک آرایه جمع آوری می کند. یک رشته ادغام شده از تمام پاسخ ها را برمی گرداند. برای زمانی که نیاز به اجرای همان پرس و جو به صورت جداگانه بر روی هر قطعه متن دارید مناسب است.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "من 10 سال دارم." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "جان 20 سال دارد." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "چند سال دارم؟",
  nodesWithScore,
);
console.log(response.response);
```

## مرجع API

- [ResponseSynthesizer (ترکیب پاسخ)](../../api/classes/ResponseSynthesizer.md)
- [Refine (بهبود)](../../api/classes/Refine.md)
- [CompactAndRefine (پیمایش کوچک و بهبود)](../../api/classes/CompactAndRefine.md)
- [TreeSummarize (خلاصه سازی درختی)](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder (سازنده پاسخ ساده)](../../api/classes/SimpleResponseBuilder.md)
