---
sidebar_position: 4
---

# ChatEngine (聊天引擎)

`Tato dokumentace byla automaticky přeložena a může obsahovat chyby. Neváhejte otevřít Pull Request pro navrhování změn.`

ChatEngine je rychlý a jednoduchý způsob, jak chatovat s daty ve vašem indexu.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// začněte chatovat
const response = await chatEngine.chat(query);
```

## Api Reference (Odkazy na API)

- [ContextChatEngine (Kontextový chatovací engine)](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine (Kondenzovaný chatovací engine)](../../api/classes/ContextChatEngine.md)
