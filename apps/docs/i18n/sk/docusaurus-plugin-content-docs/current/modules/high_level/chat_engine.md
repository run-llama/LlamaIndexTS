---
sidebar_position: 4
---

# ChatEngine (Klepetalni pogon)

`Ta dokumentacija je bila samodejno prevedena in lahko vsebuje napake. Ne oklevajte odpreti Pull Request za predlaganje sprememb.`

Klepetalni pogon je hiter in preprost način za klepetanje s podatki v vašem indeksu.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// začnite klepetati
const response = await chatEngine.chat(query);
```

## Api Reference (Api referenca)

- [ContextChatEngine (Klepetalni pogon konteksta)](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine (Klepetalni pogon za stiskanje vprašanj)](../../api/classes/ContextChatEngine.md)
