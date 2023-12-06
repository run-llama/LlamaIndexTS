---
sidebar_position: 2
---

# Sisällysluettelo

`Tämä dokumentaatio on käännetty automaattisesti ja se saattaa sisältää virheitä. Älä epäröi avata Pull Requestia ehdottaaksesi muutoksia.`

Sisällysluettelo on peruscontainer ja organisaatio tietojesi säilyttämiseen. LlamaIndex.TS tukee kahta tyyppiä indeksejä:

- `VectorStoreIndex` - lähettää LLM:lle top-k `Node`:t generoidessaan vastausta. Oletusarvoinen top-k on 2.
- `SummaryIndex` - lähettää jokaisen `Node`:n indeksissä LLM:lle vastauksen generoimiseksi.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## API Viite

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
