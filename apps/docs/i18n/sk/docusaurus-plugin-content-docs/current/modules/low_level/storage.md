---
sidebar_position: 7
---

# Shranjevanje (Storage)

`Ta dokumentacija je bila samodejno prevedena in lahko vsebuje napake. Ne oklevajte odpreti Pull Request za predlaganje sprememb.`

Shranjevanje v LlamaIndex.TS deluje samodejno, ko konfigurirate objekt `StorageContext`. Preprosto nastavite `persistDir` in ga povežite z indeksom.

Trenutno je podprto samo shranjevanje in nalaganje iz diska, z načrtovanimi prihodnjimi integracijami!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Testni tekst" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## API Referenca

- [StorageContext](../../api/interfaces/StorageContext.md)

"
