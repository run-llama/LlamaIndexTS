---
sidebar_position: 2
---

# Index

`Diese Dokumentation wurde automatisch übersetzt und kann Fehler enthalten. Zögern Sie nicht, einen Pull Request zu öffnen, um Änderungen vorzuschlagen.`

Ein Index ist der grundlegende Container und die Organisation für Ihre Daten. LlamaIndex.TS unterstützt zwei Indizes:

- `VectorStoreIndex` - sendet die Top-k-`Node`s an das LLM, wenn eine Antwort generiert wird. Die Standard-Top-k ist 2.
- `SummaryIndex` - sendet jede `Node` im Index an das LLM, um eine Antwort zu generieren.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## API-Referenz

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)
