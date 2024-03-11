---
sidebar_position: 5
---

# البيئات

`تمت ترجمة هذه الوثيقة تلقائيًا وقد تحتوي على أخطاء. لا تتردد في فتح طلب سحب لاقتراح تغييرات.`

يدعم LlamaIndex حاليًا رسميًا NodeJS 18 و NodeJS 20.

## NextJS App Router

إذا كنت تستخدم معالج الطرق / الوظائف الخادمة في NextJS App Router ، فستحتاج إلى استخدام وضع NodeJS:

```js
export const runtime = "nodejs"; // الافتراضي
```
