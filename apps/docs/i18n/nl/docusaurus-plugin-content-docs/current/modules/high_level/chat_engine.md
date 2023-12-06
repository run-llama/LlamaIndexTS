---
sidebar_position: 4
---

# ChatEngine

`Deze documentatie is automatisch vertaald en kan fouten bevatten. Aarzel niet om een Pull Request te openen om wijzigingen voor te stellen.`

De chatengine is een snelle en eenvoudige manier om te chatten met de gegevens in uw index.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// begin met chatten
const response = await chatEngine.chat(query);
```

## API Referenties

- [ContextChatEngine](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine](../../api/classes/ContextChatEngine.md)
