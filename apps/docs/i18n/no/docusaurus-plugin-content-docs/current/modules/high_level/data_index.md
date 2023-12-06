---
sidebar_position: 2
---

# Indeks

`Denne dokumentasjonen har blitt automatisk oversatt og kan inneholde feil. Ikke nøl med å åpne en Pull Request for å foreslå endringer.`

En indeks er den grunnleggende beholderen og organisasjonen for dataene dine. LlamaIndex.TS støtter to indekser:

- `VectorStoreIndex` - vil sende de øverste-k `Node`-ene til LLM når du genererer et svar. Standardverdien for øverste-k er 2.
- `SummaryIndex` - vil sende hver `Node` i indeksen til LLM for å generere et svar.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## API-referanse

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)
