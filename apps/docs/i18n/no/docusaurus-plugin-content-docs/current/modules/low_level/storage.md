---
sidebar_position: 7
---

# Lagring

`Denne dokumentasjonen har blitt automatisk oversatt og kan inneholde feil. Ikke nøl med å åpne en Pull Request for å foreslå endringer.`

Lagring i LlamaIndex.TS fungerer automatisk når du har konfigurert et `StorageContext`-objekt. Bare konfigurer `persistDir` og fest det til en indeks.

Akkurat nå støttes bare lagring og lasting fra disk, med planlagte fremtidige integrasjoner!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Testtekst" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## API-referanse

- [StorageContext](../../api/interfaces/StorageContext.md)

"
