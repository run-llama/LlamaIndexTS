---
sidebar_position: 0
---

# Dokumentumok és Csomópontok

`Ezt a dokumentációt automatikusan fordították le, és tartalmazhat hibákat. Ne habozzon nyitni egy Pull Requestet a változtatások javasolására.`

A `Dokumentumok` és a `Csomópontok` az index alapvető építőelemei. Bár ezeknek az objektumoknak az API-ja hasonló, a `Dokumentum` objektumok teljes fájlokat képviselnek, míg a `Csomópontok` kisebb darabok az eredeti dokumentumból, amelyek alkalmasak egy LLM és Q&A számára.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "szöveg", metadata: { kulcs: "érték" } });
```

## API Referencia

- [Dokumentum](../../api/classes/Document.md)
- [SzövegesCsomópont](../../api/classes/TextNode.md)

"
