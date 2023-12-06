---
sidebar_position: 4
---

`این مستند به طور خودکار ترجمه شده و ممکن است حاوی اشتباهات باشد. در صورت پیشنهاد تغییرات، دریغ نکنید از باز کردن یک Pull Request.`

# چت انجین (ChatEngine)

چت انجین یک راه سریع و ساده برای چت با داده ها در شاخص شماست.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// شروع چت
const response = await chatEngine.chat(query);
```

## مراجعه به API

- [چت انجین متن](../../api/classes/ContextChatEngine.md)
- [چت انجین سوال کوتاه](../../api/classes/ContextChatEngine.md)

"
