---
sidebar_position: 4
---

# ChatEngine (Motor de Chat)

`Esta documentación ha sido traducida automáticamente y puede contener errores. No dudes en abrir una Pull Request para sugerir cambios.`

El motor de chat es una forma rápida y sencilla de chatear con los datos en tu índice.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// comenzar a chatear
const response = await chatEngine.chat(query);
```

## Referencias de la API

- [ContextChatEngine (Motor de Chat de Contexto)](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine (Motor de Chat de Pregunta Condensada)](../../api/classes/ContextChatEngine.md)
