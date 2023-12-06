---
sidebar_position: 1
---

`Această documentație a fost tradusă automat și poate conține erori. Nu ezitați să deschideți un Pull Request pentru a sugera modificări.`

# Înglobare (Embedding)

Modelul de înglobare din LlamaIndex este responsabil pentru crearea reprezentărilor numerice ale textului. În mod implicit, LlamaIndex va utiliza modelul `text-embedding-ada-002` de la OpenAI.

Acest lucru poate fi setat explicit în obiectul `ServiceContext`.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## Referință API

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
