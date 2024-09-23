---
"@llamaindex/core": minor
"llamaindex": patch
---

refactor: move chat engine & retriever into core.

This is a breaking change since `stream` option has moved to second parameter.

- `chat` API in BaseChatEngine has changed, Move `stream` option into second parameter.
- `chatHistory` in BaseChatEngine now returns `ChatMessage[] | Promise<ChatMessage[]>`, instead of `BaseMemory`
- update `retrieve-end` type
