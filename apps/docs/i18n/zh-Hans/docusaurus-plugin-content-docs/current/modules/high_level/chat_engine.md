# ChatEngine

聊天引擎是一种快速简便的方式，可以与索引中的数据进行交流。

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// 开始聊天
const response = await chatEngine.chat(query);
```

## Api References

- [ContextChatEngine](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine](../../api/classes/ContextChatEngine.md)
