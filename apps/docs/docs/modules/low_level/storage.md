---
sidebar_position: 7
---

# Storage

Storage in LlamaIndex.TS works automatically once you've configured a `StorageContext` object. Just configure the `persistDir` and attach it to an index.

Right now, only saving and loading from disk is supported, with future integrations planned!

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

## API Reference

- [StorageContext](../../api/interfaces/StorageContext.md)
