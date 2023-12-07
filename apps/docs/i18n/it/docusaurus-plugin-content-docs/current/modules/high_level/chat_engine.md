---
sidebar_position: 4
---

# ChatEngine (Motore di Chat)

`Questa documentazione è stata tradotta automaticamente e può contenere errori. Non esitare ad aprire una Pull Request per suggerire modifiche.`

Il motore di chat è un modo rapido e semplice per chattare con i dati nel tuo indice.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// inizia a chattare
const response = await chatEngine.chat(query);
```

## Riferimenti API

- [ContextChatEngine (Motore di Chat di Contesto)](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine (Motore di Chat per Domande Condensate)](../../api/classes/ContextChatEngine.md)

"
