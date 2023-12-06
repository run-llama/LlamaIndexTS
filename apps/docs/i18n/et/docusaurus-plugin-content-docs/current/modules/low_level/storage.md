---
sidebar_position: 7
---

# Andmehoidla (Storage)

`See dokumentatsioon on tõlgitud automaatselt ja võib sisaldada vigu. Ärge kartke avada Pull Request, et pakkuda muudatusi.`

Andmehoidla LlamaIndex.TS-s töötab automaatselt, kui olete konfigureerinud `StorageContext` objekti. Lihtsalt seadistage `persistDir` ja kinnitage see indeksile.

Hetkel toetatakse ainult salvestamist ja laadimist kettalt, tulevased integreerimised on planeeritud!

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

## API viide (API Reference)

- [Andmehoidla kontekst (StorageContext)](../../api/interfaces/StorageContext.md)
