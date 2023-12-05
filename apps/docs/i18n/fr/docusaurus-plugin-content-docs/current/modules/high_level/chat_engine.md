---
sidebar_position: 4
---

# ChatEngine (Moteur de discussion)

Le moteur de discussion est un moyen rapide et simple de discuter avec les données de votre index.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// commencer la discussion
const response = await chatEngine.chat(query);
```

## Références de l'API

- [ContextChatEngine](../../api/classes/ContextChatEngine)
- [CondenseQuestionChatEngine](../../api/classes/ContextChatEngine)
