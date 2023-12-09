---
sidebar_position: 4
---

# ChatEngine (聊天引擎)

`Bu belge otomatik olarak çevrilmiştir ve hatalar içerebilir. Değişiklik önermek için bir Pull Request açmaktan çekinmeyin.`

聊天引擎是一种快速简单的与索引中的数据进行聊天的方式。

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// 开始聊天
const response = await chatEngine.chat(query);
```

## API Referansları

- [ContextChatEngine (BağlamChatMotoru)](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine (KısaltılmışSoruChatMotoru)](../../api/classes/ContextChatEngine.md)
