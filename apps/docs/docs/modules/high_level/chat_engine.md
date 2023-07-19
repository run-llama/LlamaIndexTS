---
sidebar_position: 4
---

# ChatEngine

The chat engine is a quick and simple way to chat with the data in your index.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// start chatting
const response = await chatEngine.chat(query);
```

## Api References

- [ContextChatEngine](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine](../../api/classes/ContextChatEngine.md)
