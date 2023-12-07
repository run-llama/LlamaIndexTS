---
sidebar_position: 4
---

# محرك الدردشة (ChatEngine)

`تمت ترجمة هذه الوثيقة تلقائيًا وقد تحتوي على أخطاء. لا تتردد في فتح طلب سحب لاقتراح تغييرات.`

محرك الدردشة هو طريقة سريعة وبسيطة للدردشة مع البيانات في الفهرس الخاص بك.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// بدء الدردشة
const response = await chatEngine.chat(query);
```

## مراجع الواجهة البرمجية

- [محرك الدردشة السياقي (ContextChatEngine)](../../api/classes/ContextChatEngine.md)
- [محرك الدردشة المكثف للأسئلة (CondenseQuestionChatEngine)](../../api/classes/ContextChatEngine.md)
