---
sidebar_position: 2
---

# Indice

`Questa documentazione è stata tradotta automaticamente e può contenere errori. Non esitare ad aprire una Pull Request per suggerire modifiche.`

Un indice è il contenitore e l'organizzazione di base per i tuoi dati. LlamaIndex.TS supporta due tipi di indici:

- `VectorStoreIndex` - invierà i primi `Node` al LLM quando genera una risposta. Il valore predefinito per i primi è 2.
- `SummaryIndex` - invierà ogni `Node` presente nell'indice al LLM per generare una risposta.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## Riferimento API

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
