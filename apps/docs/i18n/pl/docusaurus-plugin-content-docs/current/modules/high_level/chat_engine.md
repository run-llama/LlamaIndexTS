---
sidebar_position: 4
---

# ChatEngine (聊天引擎)

`Ta dokumentacja została przetłumaczona automatycznie i może zawierać błędy. Nie wahaj się otworzyć Pull Request, aby zaproponować zmiany.`

Silnik czatu to szybki i prosty sposób na rozmowę z danymi w Twoim indeksie.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// rozpocznij rozmowę
const response = await chatEngine.chat(query);
```

## Odwołania do interfejsu API

- [ContextChatEngine (Silnik czatu kontekstowego)](../../api/classes/ContextChatEngine.md)
- [CondenseQuestionChatEngine (Silnik czatu skondensowanego pytania)](../../api/classes/ContextChatEngine.md)
