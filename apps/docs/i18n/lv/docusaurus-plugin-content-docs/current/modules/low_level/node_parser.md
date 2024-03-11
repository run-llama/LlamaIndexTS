---
sidebar_position: 3
---

# NodeParser

`Šis dokuments ir automātiski tulkots un var saturēt kļūdas. Nevilciniet atvērt Pull Request, lai ierosinātu izmaiņas.`

`NodeParser` LlamaIndex ir atbildīgs par `Document` objektu sadalīšanu mazāk pārvaldāmos `Node` objektos. Kad jūs izsaucat `.fromDocuments()`, `NodeParser` no `ServiceContext` tiek izmantots, lai to automātiski izdarītu jums. Alternatīvi, jūs varat to izmantot, lai iepriekš sadalītu dokumentus.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Man ir 10 gadu. Džons ir 20 gadu." }),
]);
```

## TextSplitter (TextSplitter)

Pamata teksta sadalītājs sadalīs tekstu pa teikumiem. To var izmantot arī kā atsevišķu moduli, lai sadalītu neapstrādātu tekstu.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Sveika, pasaule");
```

## API atsauce

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)
