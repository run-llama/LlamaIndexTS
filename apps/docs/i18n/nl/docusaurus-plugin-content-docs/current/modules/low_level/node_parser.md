---
sidebar_position: 3
---

# NodeParser

`Deze documentatie is automatisch vertaald en kan fouten bevatten. Aarzel niet om een Pull Request te openen om wijzigingen voor te stellen.`

De `NodeParser` in LlamaIndex is verantwoordelijk voor het opsplitsen van `Document` objecten in meer beheersbare `Node` objecten. Wanneer je `.fromDocuments()` aanroept, wordt automatisch de `NodeParser` van de `ServiceContext` gebruikt om dit voor jou te doen. Je kunt het ook gebruiken om documenten van tevoren op te splitsen.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Ik ben 10 jaar oud. John is 20 jaar oud." }),
]);
```

## TextSplitter

De onderliggende tekstsplitser splitst tekst op in zinnen. Het kan ook als een op zichzelf staande module worden gebruikt om ruwe tekst op te splitsen.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Hallo Wereld");
```

## API Referentie

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)

"
