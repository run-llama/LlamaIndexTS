---
"@llamaindex/core": patch
"llamaindex": patch
---

refactor: move chat engine & retriever into core.

- `chatHistory` in BaseChatEngine now returns `ChatMessage[] | Promise<ChatMessage[]>`, instead of `BaseMemory`
- update `retrieve-end` type
