---
sidebar_position: 7
---

# Przechowywanie danych

`Ta dokumentacja została przetłumaczona automatycznie i może zawierać błędy. Nie wahaj się otworzyć Pull Request, aby zaproponować zmiany.`

Przechowywanie danych w LlamaIndex.TS działa automatycznie po skonfigurowaniu obiektu `StorageContext`. Wystarczy skonfigurować `persistDir` i dołączyć go do indeksu.

Obecnie obsługiwane jest tylko zapisywanie i wczytywanie z dysku, ale planowane są integracje z innymi źródłami!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Testowy tekst" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## Dokumentacja API

- [StorageContext](../../api/interfaces/StorageContext.md)

"
