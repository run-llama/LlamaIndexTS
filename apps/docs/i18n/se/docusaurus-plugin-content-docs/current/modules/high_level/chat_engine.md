---
sidebar_position: 4
---

# ChatEngine (Чет мотор)

`Ova dokumentacija je automatski prevedena i može sadržati greške. Ne oklevajte da otvorite Pull Request za predlaganje izmena.`

Чет мотор је брз и једноставан начин за разговор са подацима у вашем индексу.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// започни разговор
const response = await chatEngine.chat(query);
```

## Api Reference (Api Референца)

- [ContextChatEngine (Чет мотор контекста)](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine (Чет мотор за сажета питања)](../../api/classes/ContextChatEngine.md)
