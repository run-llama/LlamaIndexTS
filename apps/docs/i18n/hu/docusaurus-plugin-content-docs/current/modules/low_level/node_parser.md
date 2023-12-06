---
sidebar_position: 3
---

# NodeParser

`Ezt a dokumentációt automatikusan fordították le, és tartalmazhat hibákat. Ne habozzon nyitni egy Pull Requestet a változtatások javasolására.`

A `NodeParser` a LlamaIndex-ben felelős a `Document` objektumok felosztásáért kezelhetőbb `Node` objektumokra. Amikor a `.fromDocuments()` metódust hívod, a `ServiceContext`-ben található `NodeParser` automatikusan elvégzi ezt neked. Ezenkívül használhatod dokumentumok előzetes felosztására is.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "10 éves vagyok. John 20 éves." }),
]);
```

## TextSplitter

Az alapvető szöveg felosztó mondatokra bontja a szöveget. Ezt önálló modulként is használhatod nyers szöveg felosztására.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Helló Világ");
```

"

## API Referencia

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)

"
