---
sidebar_position: 4
---

# ChatEngine (聊天引擎)

`Tài liệu này đã được dịch tự động và có thể chứa lỗi. Đừng ngần ngại mở một Pull Request để đề xuất thay đổi.`

ChatEngine (聊天引擎) là một cách nhanh chóng và đơn giản để trò chuyện với dữ liệu trong chỉ mục của bạn.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// bắt đầu trò chuyện
const response = await chatEngine.chat(query);
```

## Tài liệu tham khảo API

- [ContextChatEngine (Ngữ cảnh ChatEngine)](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine (Ngữ cảnh CondenseQuestionChatEngine)](../../api/classes/ContextChatEngine.md)
