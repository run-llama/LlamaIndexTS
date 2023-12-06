---
sidebar_position: 7
---

# Tallennus

`Tämä dokumentaatio on käännetty automaattisesti ja se saattaa sisältää virheitä. Älä epäröi avata Pull Requestia ehdottaaksesi muutoksia.`

Tallennus LlamaIndex.TS:ssä toimii automaattisesti, kun olet määrittänyt `StorageContext`-objektin. Aseta vain `persistDir` ja liitä se indeksiin.

Tällä hetkellä tuetaan vain tallentamista ja lataamista levyltä, tulevaisuudessa on suunnitteilla lisää integraatioita!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Testiteksti" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## API-viite

- [StorageContext](../../api/interfaces/StorageContext.md)

"
