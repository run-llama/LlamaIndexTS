---
sidebar_position: 4
---

# ChatEngine (聊天引擎)

`Dokumentasi ini telah diterjemahkan secara otomatis dan mungkin mengandung kesalahan. Jangan ragu untuk membuka Pull Request untuk mengusulkan perubahan.`

ChatEngine (聊天引擎) adalah cara cepat dan sederhana untuk melakukan obrolan dengan data di indeks Anda.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// mulai melakukan obrolan
const response = await chatEngine.chat(query);
```

## Referensi API

- [ContextChatEngine (聊天引擎)](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine (聊天引擎)](../../api/classes/ContextChatEngine.md)
