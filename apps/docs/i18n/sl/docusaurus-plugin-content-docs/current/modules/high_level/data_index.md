---
sidebar_position: 2
---

# Index

`Táto dokumentácia bola automaticky preložená a môže obsahovať chyby. Neváhajte otvoriť Pull Request na navrhnutie zmien.`

Index je základný kontajner a organizácia pre vaše dáta. LlamaIndex.TS podporuje dva indexy:

- `VectorStoreIndex` - pri generovaní odpovede odosiela najlepších k `Node` do LLM. Predvolené top-k je 2.
- `SummaryIndex` - pri generovaní odpovede odosiela každý `Node` v indexe do LLM.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## API Referencia

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
