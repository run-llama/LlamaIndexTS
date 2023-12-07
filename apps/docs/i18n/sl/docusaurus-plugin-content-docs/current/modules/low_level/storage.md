---
sidebar_position: 7
---

# Úložisko (Storage)

`Táto dokumentácia bola automaticky preložená a môže obsahovať chyby. Neváhajte otvoriť Pull Request na navrhnutie zmien.`

Úložisko v LlamaIndex.TS funguje automaticky, akonáhle ste nakonfigurovali objekt `StorageContext`. Stačí nakonfigurovať `persistDir` a pripojiť ho k indexu.

Momentálne je podporované iba ukladanie a načítavanie zo disku, s plánovanými budúcimi integráciami!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Test Text" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## API Referencia

- [StorageContext](../../api/interfaces/StorageContext.md)

"
