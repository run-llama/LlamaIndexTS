---
sidebar_position: 4
---

# ChatEngine (Motor de Xat)

`Aquesta documentació s'ha traduït automàticament i pot contenir errors. No dubteu a obrir una Pull Request per suggerir canvis.`

El motor de xat és una manera ràpida i senzilla de xatejar amb les dades del teu índex.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// comença a xatejar
const response = await chatEngine.chat(query);
```

## Referències de l'API

- [ContextChatEngine (Motor de Xat de Context)](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine (Motor de Xat de Pregunta Condensada)](../../api/classes/ContextChatEngine.md)
