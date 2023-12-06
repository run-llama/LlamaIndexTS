---
sidebar_position: 3
---

# NodeParser

`Denna dokumentation har översatts automatiskt och kan innehålla fel. Tveka inte att öppna en Pull Request för att föreslå ändringar.`

`NodeParser` i LlamaIndex är ansvarig för att dela upp `Document`-objekt i mer hanterbara `Node`-objekt. När du anropar `.fromDocuments()`, används `NodeParser` från `ServiceContext` automatiskt för att göra detta åt dig. Alternativt kan du använda det för att dela upp dokument i förväg.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Jag är 10 år gammal. John är 20 år gammal." }),
]);
```

## TextSplitter

Den underliggande textdelaren delar upp texten i meningar. Den kan också användas som en fristående modul för att dela upp råtext.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Hej världen");
```

## API-referens

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)

"
