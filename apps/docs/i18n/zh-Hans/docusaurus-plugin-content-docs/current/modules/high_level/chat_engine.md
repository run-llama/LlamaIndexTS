---
sidebar_position: 4
---

# 聊天引擎 (ChatEngine)

聊天引擎是一种快速简单的方式，用于与索引中的数据进行聊天。

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// 开始聊天
const response = await chatEngine.chat(query);
```

## API 参考

- [ContextChatEngine](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine](../../api/classes/ContextChatEngine.md)
