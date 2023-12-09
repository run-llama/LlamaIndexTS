---
sidebar_position: 1
---

# Vkladanie

`Táto dokumentácia bola automaticky preložená a môže obsahovať chyby. Neváhajte otvoriť Pull Request na navrhnutie zmien.`

Model vkladania v LlamaIndexe je zodpovedný za vytváranie číselných reprezentácií textu. LlamaIndex štandardne používa model `text-embedding-ada-002` od OpenAI.

Toto je možné explicitne nastaviť v objekte `ServiceContext`.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## API Referencia

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
