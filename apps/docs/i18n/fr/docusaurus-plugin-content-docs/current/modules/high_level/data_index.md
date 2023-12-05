---
sidebar_position: 2
---

# Index

Un index est le conteneur de base et l'organisation de vos données. LlamaIndex.TS prend en charge deux types d'index :

- `VectorStoreIndex` - enverra les `Node`s les mieux classés au LLM lors de la génération d'une réponse. Le top-k par défaut est de 2.
- `SummaryIndex` - enverra chaque `Node` de l'index au LLM afin de générer une réponse.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## Référence de l'API

- [SummaryIndex](../../api/classes/SummaryIndex)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex)
