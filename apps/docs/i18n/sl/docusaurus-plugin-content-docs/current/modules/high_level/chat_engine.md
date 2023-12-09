---
sidebar_position: 4
---

# ChatEngine (ChatEngine)

`Táto dokumentácia bola automaticky preložená a môže obsahovať chyby. Neváhajte otvoriť Pull Request na navrhnutie zmien.`

ChatEngine je rýchly a jednoduchý spôsob, ako komunikovať s dátami vo vašom indexe.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// začnite chatovať
const response = await chatEngine.chat(query);
```

## Api Referencie

- [ContextChatEngine (KontextovýChatEngine)](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine (CondenseQuestionChatEngine)](../../api/classes/ContextChatEngine.md)

"
