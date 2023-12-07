---
sidebar_position: 3
---

# NodeParser (NodeParser)

`Ši dokumentacija buvo automatiškai išversta ir gali turėti klaidų. Nedvejodami atidarykite Pull Request, jei norite pasiūlyti pakeitimus.`

`NodeParser` LlamaIndex bibliotekoje yra atsakingas už `Document` objektų padalinimą į lengviau tvarkomus `Node` objektus. Kai iškviečiate `.fromDocuments()`, `NodeParser` iš `ServiceContext` yra naudojamas automatiškai tai padaryti už jus. Alternatyviai, jį galite naudoti, kad iš anksto padalintumėte dokumentus.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Man yra 10 metų. Jonas yra 20 metų." }),
]);
```

## TextSplitter (TextSplitter)

Pagrindinis teksto padalintojas padalins tekstą į sakiniais. Jį taip pat galima naudoti kaip atskirą modulį, skirtą žaliavų tekstui padalinti.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Sveikas, pasauli");
```

## API nuorodos

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)

"
