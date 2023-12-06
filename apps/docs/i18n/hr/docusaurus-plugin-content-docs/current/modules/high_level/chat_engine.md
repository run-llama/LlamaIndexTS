---
sidebar_position: 4
---

# ChatEngine (聊天引擎)

`Ova dokumentacija je automatski prevedena i može sadržavati greške. Ne ustručavajte se otvoriti Pull Request za predlaganje promjena.`

ChatEngine (聊天引擎) je brz i jednostavan način za razgovor s podacima u vašem indeksu.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// započnite razgovor
const response = await chatEngine.chat(query);
```

## Api Reference (Api referenca)

- [ContextChatEngine (KontekstChatEngine)](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine (CondenseQuestionChatEngine)](../../api/classes/ContextChatEngine.md)

"
