---
sidebar_position: 2
---

# Index (Index)

`Ezt a dokumentációt automatikusan fordították le, és tartalmazhat hibákat. Ne habozzon nyitni egy Pull Requestet a változtatások javasolására.`

Az index az adatok alapvető tárolója és szervezője. A LlamaIndex.TS két indexet támogat:

- `VectorStoreIndex` - a legjobb-k `Node`-okat küldi a LLM-nek válasz generálásakor. Az alapértelmezett legjobb-k érték 2.
- `SummaryIndex` - minden `Node`-ot elküld az indexben a LLM-nek válasz generálásához

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "teszt" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## API referencia

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
