---
sidebar_position: 4
---

# Чатовий двигун (ChatEngine)

`Ця документація була автоматично перекладена і може містити помилки. Не соромтеся відкривати Pull Request, щоб запропонувати зміни.`

Чатовий двигун - це швидкий і простий спосіб спілкування з даними у вашому індексі.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// початок спілкування
const response = await chatEngine.chat(query);
```

## Посилання на API

- [Чатовий двигун контексту (ContextChatEngine)](../../api/classes/ContextChatEngine.md)
- [Чатовий двигун стиснення запитань (CondenseQuestionChatEngine)](../../api/classes/ContextChatEngine.md)
