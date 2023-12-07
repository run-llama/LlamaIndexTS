---
sidebar_position: 4
---

# ChatEngine (聊天引擎)

`Denne dokumentation er blevet automatisk oversat og kan indeholde fejl. Tøv ikke med at åbne en Pull Request for at foreslå ændringer.`

ChatEngine (聊天引擎) er en hurtig og enkel måde at chatte med dataene i din indeks.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// start chatting
const response = await chatEngine.chat(query);
```

## Api Referencer

- [ContextChatEngine (KontekstChatEngine)](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine (CondenseQuestionChatEngine)](../../api/classes/ContextChatEngine.md)
