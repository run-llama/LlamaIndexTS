---
sidebar_position: 4
---

# ChatEngine (Pokalbių variklis)

`Ši dokumentacija buvo automatiškai išversta ir gali turėti klaidų. Nedvejodami atidarykite Pull Request, jei norite pasiūlyti pakeitimus.`

Pokalbių variklis yra greitas ir paprastas būdas bendrauti su duomenimis savo indekse.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// pradėti pokalbį
const response = await chatEngine.chat(query);
```

## API nuorodos

- [ContextChatEngine](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine](../../api/classes/ContextChatEngine.md)
