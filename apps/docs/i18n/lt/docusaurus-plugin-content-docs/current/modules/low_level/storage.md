---
sidebar_position: 7
---

# Saugojimas

`Ši dokumentacija buvo automatiškai išversta ir gali turėti klaidų. Nedvejodami atidarykite Pull Request, jei norite pasiūlyti pakeitimus.`

Saugojimas LlamaIndex.TS veikia automatiškai, kai jūs sukonfigūruojate `StorageContext` objektą. Tiesiog sukonfigūruokite `persistDir` ir pridėkite jį prie indekso.

Šiuo metu palaikomas tik išsaugojimas ir įkėlimas iš disko, su planuojamomis ateities integracijomis!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Testo tekstas" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## API Nuorodos

- [StorageContext](../../api/interfaces/StorageContext.md)
