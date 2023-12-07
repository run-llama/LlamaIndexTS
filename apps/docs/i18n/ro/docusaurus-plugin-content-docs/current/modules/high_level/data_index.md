---
sidebar_position: 2
---

# Index

`Această documentație a fost tradusă automat și poate conține erori. Nu ezitați să deschideți un Pull Request pentru a sugera modificări.`

Un index este containerul de bază și organizarea datelor tale. LlamaIndex.TS suportă două tipuri de index:

- `VectorStoreIndex` - va trimite primele `Node`-uri către LLM atunci când generează un răspuns. Valoarea implicită pentru primele `k` este 2.
- `SummaryIndex` - va trimite fiecare `Node` din index către LLM pentru a genera un răspuns.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## Referință API

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)
