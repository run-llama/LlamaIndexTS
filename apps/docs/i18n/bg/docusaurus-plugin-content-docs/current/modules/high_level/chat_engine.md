---
sidebar_position: 4
---

# Чат двигател (ChatEngine)

`Тази документация е преведена автоматично и може да съдържа грешки. Не се колебайте да отворите Pull Request, за да предложите промени.`

Чат двигателят е бърз и прост начин да чатите с данните във вашата индекс.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// започнете да чатите
const response = await chatEngine.chat(query);
```

## Api Референции

- [Чат двигател за контекст (ContextChatEngine)](../../api/classes/ContextChatEngine.md)
- [Чат двигател за кондензиране на въпроси (CondenseQuestionChatEngine)](../../api/classes/ContextChatEngine.md)

"
