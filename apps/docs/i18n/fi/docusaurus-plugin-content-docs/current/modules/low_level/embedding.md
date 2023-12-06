---
sidebar_position: 1
---

# Upotus

`Tämä dokumentaatio on käännetty automaattisesti ja se saattaa sisältää virheitä. Älä epäröi avata Pull Requestia ehdottaaksesi muutoksia.`

Upotusmalli LlamaIndexissä vastaa tekstin numeeristen edustusten luomisesta. Oletusarvoisesti LlamaIndex käyttää OpenAI:n `text-embedding-ada-002` -mallia.

Tämä voidaan asettaa nimenomaisesti `ServiceContext`-objektissa.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## API-viite

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
