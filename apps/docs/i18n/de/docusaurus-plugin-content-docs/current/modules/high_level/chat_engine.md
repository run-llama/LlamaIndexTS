---
sidebar_position: 4
---

# ChatEngine (聊天引擎)

`Diese Dokumentation wurde automatisch übersetzt und kann Fehler enthalten. Zögern Sie nicht, einen Pull Request zu öffnen, um Änderungen vorzuschlagen.`

Der Chat-Engine ist eine schnelle und einfache Möglichkeit, mit den Daten in Ihrem Index zu chatten.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// start chatting
const response = await chatEngine.chat(query);
```

## API-Referenzen

- [ContextChatEngine (Kontext-Chat-Engine)](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine (Kondensierte-Fragen-Chat-Engine)](../../api/classes/ContextChatEngine.md)
