---
sidebar_position: 4
---

# ChatEngine (聊天引擎)

`Denna dokumentation har översatts automatiskt och kan innehålla fel. Tveka inte att öppna en Pull Request för att föreslå ändringar.`

Chattmotorn är ett snabbt och enkelt sätt att chatta med data i din index.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// börja chatta
const response = await chatEngine.chat(query);
```

## Api-referenser

- [ContextChatEngine (Kontextchattmotor)](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine (SammanfattaFrågaChattmotor)](../../api/classes/ContextChatEngine.md)
