---
sidebar_position: 2
---

# Indeks

`Ova dokumentacija je automatski prevedena i može sadržavati greške. Ne ustručavajte se otvoriti Pull Request za predlaganje promjena.`

Indeks je osnovni spremnik i organizacija za vaše podatke. LlamaIndex.TS podržava dva indeksa:

- `VectorStoreIndex` - će poslati najboljih-k `Node`-ova LLM-u prilikom generiranja odgovora. Zadani najboljih-k je 2.
- `SummaryIndex` - će poslati svaki `Node` u indeksu LLM-u kako bi generirao odgovor.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## API Referenca

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
