---
sidebar_position: 7
---

# Stockage

Le stockage dans LlamaIndex.TS fonctionne automatiquement une fois que vous avez configuré un objet `StorageContext`. Il vous suffit de configurer le `persistDir` et de l'attacher à un index.

Actuellement, seule la sauvegarde et le chargement depuis le disque sont pris en charge, avec des intégrations futures prévues !

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

## Référence de l'API

- [StorageContext](../../api/interfaces/StorageContext)
