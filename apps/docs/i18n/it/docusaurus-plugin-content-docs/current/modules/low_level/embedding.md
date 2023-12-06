---
sidebar_position: 1
---

# Incorporazione

`Questa documentazione è stata tradotta automaticamente e può contenere errori. Non esitare ad aprire una Pull Request per suggerire modifiche.`

Il modello di incorporazione in LlamaIndex è responsabile per la creazione di rappresentazioni numeriche del testo. Per impostazione predefinita, LlamaIndex utilizzerà il modello `text-embedding-ada-002` di OpenAI.

Ciò può essere esplicitamente impostato nell'oggetto `ServiceContext`.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## Riferimento API

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
