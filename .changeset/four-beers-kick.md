---
"@llamaindex/core": patch
"llamaindex": patch
---

refactor: move chat engine & retriever into core

- `chat` API in BaseChatEngine has changed, Move `stream` option into second parameter.
- `chatHistory` in BaseChatEngine now returns `ChatMessage[] | Promise<ChatMessage[]>`
- update `retrieve-end` type
