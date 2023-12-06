---
sidebar_position: 4
---

# 聊天引擎 (ChatEngine)

`このドキュメントは自動的に翻訳されており、誤りを含んでいる可能性があります。変更を提案するためにプルリクエストを開くことを躊躇しないでください。`

聊天引擎是一种快速简单的与索引中的数据进行聊天的方式。

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// 开始聊天
const response = await chatEngine.chat(query);
```

## API 参考

- [聊天引擎 (ContextChatEngine)](../../api/classes/ContextChatEngine.md)
- [压缩问题聊天引擎 (CondenseQuestionChatEngine)](../../api/classes/ContextChatEngine.md)
