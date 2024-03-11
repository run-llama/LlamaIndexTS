---
sidebar_position: 2
---

# Indeks

`Denne dokumentation er blevet automatisk oversat og kan indeholde fejl. Tøv ikke med at åbne en Pull Request for at foreslå ændringer.`

Et indeks er den grundlæggende beholder og organisering af dine data. LlamaIndex.TS understøtter to indeks:

- `VectorStoreIndex` - sender de øverste-k `Node`er til LLM, når der genereres et svar. Standard top-k er 2.
- `SummaryIndex` - sender hver `Node` i indekset til LLM for at generere et svar.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## API Reference

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
