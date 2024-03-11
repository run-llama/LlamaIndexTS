---
sidebar_position: 4
---

# ChatEngine (Motor de Chat)

`Esta documentação foi traduzida automaticamente e pode conter erros. Não hesite em abrir um Pull Request para sugerir alterações.`

O motor de chat é uma maneira rápida e simples de conversar com os dados em seu índice.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// iniciar conversa
const response = await chatEngine.chat(query);
```

## Referências de API

- [ContextChatEngine (Motor de Chat de Contexto)](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine (Motor de Chat de Perguntas Condensadas)](../../api/classes/ContextChatEngine.md)
