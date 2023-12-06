---
sidebar_position: 2
---

# Indeks

`Ova dokumentacija je automatski prevedena i može sadržati greške. Ne oklevajte da otvorite Pull Request za predlaganje izmena.`

Indeks je osnovni kontejner i organizacija za vaše podatke. LlamaIndex.TS podržava dva indeksa:

- `VectorStoreIndex` - će poslati najboljih k `Node`-ova LLM-u prilikom generisanja odgovora. Podrazumevani broj najboljih je 2.
- `SummaryIndex` - će poslati svaki `Node` u indeksu LLM-u kako bi generisao odgovor.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## API Referenca

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
