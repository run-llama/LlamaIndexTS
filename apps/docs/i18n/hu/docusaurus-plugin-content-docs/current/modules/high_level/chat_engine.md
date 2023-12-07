---
sidebar_position: 4
---

# ChatEngine (聊天引擎)

`Ezt a dokumentációt automatikusan fordították le, és tartalmazhat hibákat. Ne habozzon nyitni egy Pull Requestet a változtatások javasolására.`

A chat engine egy gyors és egyszerű módja annak, hogy beszélgethessen az indexben található adatokkal.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// beszélgetés indítása
const response = await chatEngine.chat(query);
```

## Api Referenciák

- [ContextChatEngine (KontextusChatEngine)](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine (RövidítettKérdésChatEngine)](../../api/classes/ContextChatEngine.md)

"
