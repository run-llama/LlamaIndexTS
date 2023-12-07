---
sidebar_position: 7
---

# Pohrana (Storage)

`Ova dokumentacija je automatski prevedena i može sadržavati greške. Ne ustručavajte se otvoriti Pull Request za predlaganje promjena.`

Pohrana u LlamaIndex.TS radi automatski nakon što ste konfigurirali objekt `StorageContext`. Samo konfigurirajte `persistDir` i dodijelite ga indeksu.

Trenutno je podržano samo spremanje i učitavanje s diska, s planiranim budućim integracijama!

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
