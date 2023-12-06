---
sidebar_position: 4
---

# Чат-движок (ChatEngine)

`Эта документация была автоматически переведена и может содержать ошибки. Не стесняйтесь открывать Pull Request для предложения изменений.`

Чат-движок - это быстрый и простой способ общаться с данными в вашем индексе.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// начать общение
const response = await chatEngine.chat(query);
```

## Ссылки на API

- [Чат-движок контекста (ContextChatEngine)](../../api/classes/ContextChatEngine.md)
- [Чат-движок сжатия вопросов (CondenseQuestionChatEngine)](../../api/classes/ContextChatEngine.md)
