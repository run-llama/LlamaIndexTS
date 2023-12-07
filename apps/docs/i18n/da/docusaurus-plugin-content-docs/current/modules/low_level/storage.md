---
sidebar_position: 7
---

# Opbevaring

`Denne dokumentation er blevet automatisk oversat og kan indeholde fejl. Tøv ikke med at åbne en Pull Request for at foreslå ændringer.`

Opbevaring i LlamaIndex.TS fungerer automatisk, når du har konfigureret et `StorageContext` objekt. Du skal bare konfigurere `persistDir` og tilknytte det til en indeks.

Lige nu understøttes kun gemme og indlæse fra disk, med planlagte fremtidige integrationer!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Test Tekst" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## API Reference

- [StorageContext](../../api/interfaces/StorageContext.md)

"
