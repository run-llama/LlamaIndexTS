---
sidebar_position: 7
---

# Lagring

`Denna dokumentation har översatts automatiskt och kan innehålla fel. Tveka inte att öppna en Pull Request för att föreslå ändringar.`

Lagring i LlamaIndex.TS fungerar automatiskt när du har konfigurerat en `StorageContext`-objekt. Konfigurera bara `persistDir` och bifoga den till en index.

För närvarande stöds endast spara och ladda från disk, med framtida integrationer planerade!

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

## API Referens

- [StorageContext](../../api/interfaces/StorageContext.md)

"
