---
sidebar_position: 4
---

# ChatEngine (聊天引擎)

`Denne dokumentasjonen har blitt automatisk oversatt og kan inneholde feil. Ikke nøl med å åpne en Pull Request for å foreslå endringer.`

聊天引擎是一种快速简便的与索引中的数据进行聊天的方式。

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// 开始聊天
const response = await chatEngine.chat(query);
```

## API-referanser

- [ContextChatEngine (KontekstChatEngine)](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine (KondensereSpørsmålChatEngine)](../../api/classes/ContextChatEngine.md)
