---
sidebar_position: 2
---

# Index

`Deze documentatie is automatisch vertaald en kan fouten bevatten. Aarzel niet om een Pull Request te openen om wijzigingen voor te stellen.`

Een index is de basiscontainer en organisatie voor uw gegevens. LlamaIndex.TS ondersteunt twee indexes:

- `VectorStoreIndex` - stuurt de top-k `Node`s naar de LLM bij het genereren van een reactie. De standaard top-k is 2.
- `SummaryIndex` - stuurt elke `Node` in de index naar de LLM om een reactie te genereren.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## API Referentie

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)
