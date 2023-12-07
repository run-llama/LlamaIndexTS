---
sidebar_position: 7
---

# Almacenamiento

`Esta documentación ha sido traducida automáticamente y puede contener errores. No dudes en abrir una Pull Request para sugerir cambios.`

El almacenamiento en LlamaIndex.TS funciona automáticamente una vez que hayas configurado un objeto `StorageContext`. Simplemente configura el `persistDir` y adjúntalo a un índice.

¡En este momento, solo se admite guardar y cargar desde el disco, con integraciones futuras planeadas!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Texto de prueba" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## Referencia de la API

- [StorageContext](../../api/interfaces/StorageContext.md)

"
