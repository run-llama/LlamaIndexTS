---
sidebar_position: 3
---

# NodeParser

`Aquesta documentació s'ha traduït automàticament i pot contenir errors. No dubteu a obrir una Pull Request per suggerir canvis.`

El `NodeParser` a LlamaIndex és responsable de dividir els objectes `Document` en objectes `Node` més manejables. Quan truqueu a `.fromDocuments()`, s'utilitza el `NodeParser` del `ServiceContext` per fer-ho automàticament per a vosaltres. Alternativament, podeu utilitzar-lo per dividir els documents amb antelació.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Tinc 10 anys. John té 20 anys." }),
]);
```

## TextSplitter

El separador de text subjacent dividirà el text per frases. També es pot utilitzar com a mòdul independent per dividir text en brut.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Hola món");
```

"

## Referència de l'API

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)

"
