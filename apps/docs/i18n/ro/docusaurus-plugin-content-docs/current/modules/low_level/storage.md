---
sidebar_position: 7
---

# Stocare

`Această documentație a fost tradusă automat și poate conține erori. Nu ezitați să deschideți un Pull Request pentru a sugera modificări.`

Stocarea în LlamaIndex.TS funcționează automat odată ce ați configurat un obiect `StorageContext`. Doar configurați `persistDir` și atașați-l la un index.

În prezent, este suportată doar salvarea și încărcarea de pe disc, cu integrări viitoare planificate!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Text de test" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## Referință API

- [StorageContext](../../api/interfaces/StorageContext.md)

"
