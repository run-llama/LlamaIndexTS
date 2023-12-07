---
sidebar_position: 2
---

# Índex

`Aquesta documentació s'ha traduït automàticament i pot contenir errors. No dubteu a obrir una Pull Request per suggerir canvis.`

Un índex és el contenidor bàsic i l'organització de les dades. LlamaIndex.TS suporta dos índexos:

- `VectorStoreIndex` - enviarà els `Node`s més rellevants al LLM quan generi una resposta. El valor per defecte de top-k és 2.
- `SummaryIndex` - enviarà cada `Node` de l'índex al LLM per generar una resposta.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "prova" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## Referència de l'API

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)
