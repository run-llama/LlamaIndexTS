---
sidebar_position: 7
---

# Krātuve

`Šis dokuments ir automātiski tulkots un var saturēt kļūdas. Nevilciniet atvērt Pull Request, lai ierosinātu izmaiņas.`

Krātuve LlamaIndex.TS darbojas automātiski, kad jūs konfigurējat `StorageContext` objektu. Vienkārši konfigurējiet `persistDir` un pievienojiet to indeksam.

Pašlaik tikai saglabāšana un ielāde no diska ir atbalstīta, ar plānotām nākotnes integrācijām!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Testa teksts" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## API Atsauce

- [StorageContext](../../api/interfaces/StorageContext.md)

"
