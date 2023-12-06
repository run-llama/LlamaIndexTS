---
sidebar_position: 2
---

# Indeks

`See dokumentatsioon on tõlgitud automaatselt ja võib sisaldada vigu. Ärge kartke avada Pull Request, et pakkuda muudatusi.`

Indeks on teie andmete põhiline konteiner ja korraldus. LlamaIndex.TS toetab kahte indeksit:

- `VectorStoreIndex` - saadab LLM-ile vastuse genereerimisel ülem-k `Node`-d. Vaikimisi ülem-k on 2.
- `SummaryIndex` - saadab iga `Node` indeksis LLM-ile vastuse genereerimiseks

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## API viide

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
