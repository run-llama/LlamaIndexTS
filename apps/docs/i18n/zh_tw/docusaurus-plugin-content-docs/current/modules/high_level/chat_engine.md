---
sidebar_position: 4
---

# 聊天引擎 (ChatEngine)

`此文件已自動翻譯，可能包含錯誤。如有更改建議，請毫不猶豫地提交 Pull Request。`

聊天引擎是一种快速简单的与索引中的数据进行聊天的方式。

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// 开始聊天
const response = await chatEngine.chat(query);
```

## API 参考

- [上下文聊天引擎 (ContextChatEngine)](../../api/classes/ContextChatEngine.md)
- [压缩问题聊天引擎 (CondenseQuestionChatEngine)](../../api/classes/ContextChatEngine.md)
