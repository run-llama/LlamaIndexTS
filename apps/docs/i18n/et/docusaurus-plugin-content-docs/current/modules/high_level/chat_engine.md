---
sidebar_position: 4
---

# ChatEngine (聊天引擎)

`See dokumentatsioon on tõlgitud automaatselt ja võib sisaldada vigu. Ärge kartke avada Pull Request, et pakkuda muudatusi.`

ChatEngine (聊天引擎) on kiire ja lihtne viis suhelda andmetega oma indeksis.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// alusta vestlust
const response = await chatEngine.chat(query);
```

## API viited

- [ContextChatEngine (KontekstVestlusMootor)](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine (KontekstVestlusMootor)](../../api/classes/ContextChatEngine.md)
