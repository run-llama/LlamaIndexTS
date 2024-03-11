---
sidebar_position: 2
---

# Index (Index)

`Tato dokumentace byla automaticky přeložena a může obsahovat chyby. Neváhejte otevřít Pull Request pro navrhování změn.`

Index je základním kontejnerem a organizací vašich dat. LlamaIndex.TS podporuje dva indexy:

- `VectorStoreIndex` - při generování odpovědi odešle nejlepších k `Node` do LLM. Výchozí hodnota pro nejlepších k je 2.
- `SummaryIndex` - při generování odpovědi odešle každý `Node` v indexu do LLM.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## API Reference (API Reference)

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
