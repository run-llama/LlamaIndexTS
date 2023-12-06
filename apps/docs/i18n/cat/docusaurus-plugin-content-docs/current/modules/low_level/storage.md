---
sidebar_position: 7
---

# Emmagatzematge

`Aquesta documentació s'ha traduït automàticament i pot contenir errors. No dubteu a obrir una Pull Request per suggerir canvis.`

L'emmagatzematge a LlamaIndex.TS funciona automàticament un cop hagueu configurat un objecte `StorageContext`. Simplement configureu el `persistDir` i adjunteu-lo a un índex.

En aquest moment, només s'admet guardar i carregar des del disc, amb integracions futures planejades!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Text de prova" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## Referència de l'API

- [StorageContext](../../api/interfaces/StorageContext.md)

"
