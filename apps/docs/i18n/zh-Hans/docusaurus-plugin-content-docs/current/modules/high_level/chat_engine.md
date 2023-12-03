---
sidebar_position: 4
---

# ChatEngine

聊天引擎是与索引中的数据进行快速简单交流的方式。

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// 开始聊天
const response = await chatEngine.chat(query);
```

## API 参考

- [ContextChatEngine](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine](../../api/classes/ContextChatEngine.md)
