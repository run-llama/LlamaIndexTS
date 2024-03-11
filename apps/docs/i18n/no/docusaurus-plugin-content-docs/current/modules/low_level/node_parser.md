---
sidebar_position: 3
---

# NodeParser

`Denne dokumentasjonen har blitt automatisk oversatt og kan inneholde feil. Ikke nøl med å åpne en Pull Request for å foreslå endringer.`

`NodeParser` i LlamaIndex er ansvarlig for å dele opp `Document`-objekter i mer håndterbare `Node`-objekter. Når du kaller `.fromDocuments()`, brukes `NodeParser` fra `ServiceContext` til å gjøre dette automatisk for deg. Alternativt kan du bruke den til å dele opp dokumenter på forhånd.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Jeg er 10 år gammel. John er 20 år gammel." }),
]);
```

## TextSplitter

Den underliggende tekstsplitteren deler teksten opp i setninger. Den kan også brukes som en frittstående modul for å dele opp rå tekst.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Hei verden");
```

## API-referanse

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)

"
