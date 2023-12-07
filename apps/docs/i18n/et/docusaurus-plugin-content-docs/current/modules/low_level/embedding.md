---
sidebar_position: 1
---

# Sisseehitamine (Embedding)

`See dokumentatsioon on tõlgitud automaatselt ja võib sisaldada vigu. Ärge kartke avada Pull Request, et pakkuda muudatusi.`

Sisseehitamise mudel LlamaIndexis vastutab teksti numbriliste esituste loomise eest. Vaikimisi kasutab LlamaIndex OpenAI `text-embedding-ada-002` mudelit.

Seda saab selgelt määrata `ServiceContext` objektis.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## API viide

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
