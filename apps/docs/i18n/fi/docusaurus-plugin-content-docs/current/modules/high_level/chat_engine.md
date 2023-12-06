---
sidebar_position: 4
---

`Tämä dokumentaatio on käännetty automaattisesti ja se saattaa sisältää virheitä. Älä epäröi avata Pull Requestia ehdottaaksesi muutoksia.`

# ChatEngine (聊天引擎)

ChatEngine on nopea ja yksinkertainen tapa keskustella tietojen kanssa indeksissäsi.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// aloita keskustelu
const response = await chatEngine.chat(query);
```

## Api-viittaukset

- [ContextChatEngine (KontekstiKeskusteluMoottori)](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine (TiivistäKysymysKeskusteluMoottori)](../../api/classes/ContextChatEngine.md)

"
