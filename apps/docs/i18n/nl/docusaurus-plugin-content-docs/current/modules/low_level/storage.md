---
sidebar_position: 7
---

# Opslag

`Deze documentatie is automatisch vertaald en kan fouten bevatten. Aarzel niet om een Pull Request te openen om wijzigingen voor te stellen.`

Opslag in LlamaIndex.TS werkt automatisch zodra je een `StorageContext` object hebt geconfigureerd. Configureer gewoon de `persistDir` en voeg deze toe aan een index.

Op dit moment wordt alleen het opslaan en laden vanaf de schijf ondersteund, met toekomstige integraties gepland!

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

## API Referentie

- [StorageContext](../../api/interfaces/StorageContext.md)

"
