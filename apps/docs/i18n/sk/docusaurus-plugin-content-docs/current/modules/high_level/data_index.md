---
sidebar_position: 2
---

# Kazalo

`Ta dokumentacija je bila samodejno prevedena in lahko vsebuje napake. Ne oklevajte odpreti Pull Request za predlaganje sprememb.`

Kazalo je osnovni kontejner in organizacija za vaše podatke. LlamaIndex.TS podpira dve kazali:

- `VectorStoreIndex` - bo poslal najboljše `Node` v LLM pri generiranju odgovora. Privzeto je najboljše 2.
- `SummaryIndex` - bo poslal vsak `Node` v kazalu v LLM, da generira odgovor.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## API Referenca

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
