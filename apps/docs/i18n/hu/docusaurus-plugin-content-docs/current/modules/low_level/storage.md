---
sidebar_position: 7
---

# Tárolás

`Ezt a dokumentációt automatikusan fordították le, és tartalmazhat hibákat. Ne habozzon nyitni egy Pull Requestet a változtatások javasolására.`

A tárolás a LlamaIndex.TS-ben automatikusan működik, miután konfiguráltál egy `StorageContext` objektumot. Csak állítsd be a `persistDir`-t és csatold azt egy indexhez.

Jelenleg csak a lemezre történő mentés és betöltés támogatott, a jövőbeni integrációk tervezés alatt állnak!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Teszt szöveg" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## API Referencia

- [StorageContext](../../api/interfaces/StorageContext.md)

"
