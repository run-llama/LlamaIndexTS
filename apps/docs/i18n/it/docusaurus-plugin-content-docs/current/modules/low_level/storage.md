---
sidebar_position: 7
---

# Archiviazione

`Questa documentazione è stata tradotta automaticamente e può contenere errori. Non esitare ad aprire una Pull Request per suggerire modifiche.`

L'archiviazione in LlamaIndex.TS funziona automaticamente una volta configurato un oggetto `StorageContext`. Basta configurare il `persistDir` e collegarlo a un indice.

Al momento, è supportato solo il salvataggio e il caricamento da disco, con integrazioni future in programma!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Testo di prova" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## Riferimento API

- [StorageContext](../../api/interfaces/StorageContext.md)

"
