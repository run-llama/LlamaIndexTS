---
sidebar_position: 2
---

# Indekss

`Šis dokuments ir automātiski tulkots un var saturēt kļūdas. Nevilciniet atvērt Pull Request, lai ierosinātu izmaiņas.`

Indekss ir pamata konteineris un organizācija jūsu datiem. LlamaIndex.TS atbalsta divus indeksus:

- `VectorStoreIndex` - ģenerējot atbildi, nosūtīs augstākās `Node` vērtības uz LLM. Noklusējuma augstākās vērtības ir 2.
- `SummaryIndex` - nosūtīs katru `Node` indeksā uz LLM, lai ģenerētu atbildi.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "tests" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## API Atsauce

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
