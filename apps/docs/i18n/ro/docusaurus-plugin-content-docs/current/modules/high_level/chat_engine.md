---
sidebar_position: 4
---

# ChatEngine (Motor de Chat)

`Această documentație a fost tradusă automat și poate conține erori. Nu ezitați să deschideți un Pull Request pentru a sugera modificări.`

Motorul de chat este o modalitate rapidă și simplă de a comunica cu datele din indexul tău.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// începe conversația
const response = await chatEngine.chat(query);
```

## Referințe API

- [ContextChatEngine (Motor de Chat în Context)](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine (Motor de Chat pentru Întrebări Condensate)](../../api/classes/ContextChatEngine.md)

"
