---
sidebar_position: 7
---

# Úložiště

`Tato dokumentace byla automaticky přeložena a může obsahovat chyby. Neváhejte otevřít Pull Request pro navrhování změn.`

Úložiště v LlamaIndex.TS funguje automaticky poté, co jste nakonfigurovali objekt `StorageContext`. Stačí nakonfigurovat `persistDir` a připojit ho k indexu.

V současné době je podporováno pouze ukládání a načítání z disku, s plánovanými budoucími integracemi!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Testovací text" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## API Reference

- [StorageContext](../../api/interfaces/StorageContext.md)

"
