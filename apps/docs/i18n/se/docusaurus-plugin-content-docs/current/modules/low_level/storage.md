---
sidebar_position: 7
---

# Skladište (Storage)

`Ova dokumentacija je automatski prevedena i može sadržati greške. Ne oklevajte da otvorite Pull Request za predlaganje izmena.`

Skladište u LlamaIndex.TS automatski funkcioniše kada konfigurišete objekat `StorageContext`. Samo konfigurišite `persistDir` i povežite ga sa indeksom.

Trenutno je podržano samo čuvanje i učitavanje sa diska, sa planiranim budućim integracijama!

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

## API Referenca

- [StorageContext](../../api/interfaces/StorageContext.md)

"
