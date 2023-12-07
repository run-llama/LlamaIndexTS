---
sidebar_position: 3
---

# NodeParser

`Denne dokumentation er blevet automatisk oversat og kan indeholde fejl. Tøv ikke med at åbne en Pull Request for at foreslå ændringer.`

`NodeParser` i LlamaIndex er ansvarlig for at opdele `Document` objekter i mere håndterbare `Node` objekter. Når du kalder `.fromDocuments()`, bruges `NodeParser` fra `ServiceContext` til automatisk at gøre dette for dig. Alternativt kan du bruge det til at opdele dokumenter på forhånd.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Jeg er 10 år gammel. John er 20 år gammel." }),
]);
```

## TextSplitter

Den underliggende tekstsplitter opdeler teksten i sætninger. Den kan også bruges som en selvstændig modul til at opdele rå tekst.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Hej Verden");
```

## API Reference

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)

"
