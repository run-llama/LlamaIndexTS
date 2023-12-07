---
sidebar_position: 4
---

# Čata dzinējs (ChatEngine)

`Šis dokuments ir automātiski tulkots un var saturēt kļūdas. Nevilciniet atvērt Pull Request, lai ierosinātu izmaiņas.`

Čata dzinējs ir ātrs un vienkāršs veids, kā sazināties ar datiem savā indeksā.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// sākt čatošanu
const response = await chatEngine.chat(query);
```

## Api atsauces

- [Konteksta čata dzinējs (ContextChatEngine)](../../api/classes/ContextChatEngine.md)
- [Kompaktā jautājumu čata dzinējs (CondenseQuestionChatEngine)](../../api/classes/ContextChatEngine.md)
