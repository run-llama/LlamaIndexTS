---
sidebar_position: 4
---

# ChatEngine

The chat engine is a quick and simple way to chat with the data in your index.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// start chatting
const response = await chatEngine.chat({ message: query });
```

The `chat` function also supports streaming, just add `stream: true` as an option:

```typescript
const stream = await chatEngine.chat({ message: query, stream: true });
for await (const chunk of stream) {
  process.stdout.write(chunk.response);
}
```

## Api References

- [ContextChatEngine](../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine](../api/classes/ContextChatEngine.md)
