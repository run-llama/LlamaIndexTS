---
sidebar_position: 2
---

# Indeksas

`Ši dokumentacija buvo automatiškai išversta ir gali turėti klaidų. Nedvejodami atidarykite Pull Request, jei norite pasiūlyti pakeitimus.`

Indeksas yra pagrindinis jūsų duomenų konteineris ir organizavimo būdas. LlamaIndex.TS palaiko du indeksus:

- `VectorStoreIndex` - generuojant atsakymą, siųs LLM viršutinius `Node`'us. Numatytasis viršutinių `Node`'ų skaičius yra 2.
- `SummaryIndex` - generuojant atsakymą, siųs visus indekso `Node`'us LLM

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## API Nuorodos

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
