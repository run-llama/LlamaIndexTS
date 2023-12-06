---
sidebar_position: 3
---

# NodeParser (Razčlenjevalnik vozlišč)

`Ta dokumentacija je bila samodejno prevedena in lahko vsebuje napake. Ne oklevajte odpreti Pull Request za predlaganje sprememb.`

`NodeParser` v LlamaIndexu je odgovoren za razdeljevanje objektov `Document` v bolj obvladljive objekte `Node`. Ko pokličete `.fromDocuments()`, se `NodeParser` iz `ServiceContext`a uporabi za samodejno razdeljevanje. Lahko pa ga uporabite tudi za predhodno razdeljevanje dokumentov.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Star sem 10 let. John je star 20 let." }),
]);
```

## TextSplitter (Razčlenjevalnik besedila)

Podrejeni razčlenjevalnik besedila bo besedilo razdelil na stavke. Lahko se uporablja tudi kot samostojni modul za razdeljevanje surovega besedila.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Pozdravljen svet");
```

"

## API Reference (Referenca API-ja)

- [SimpleNodeParser (Preprost razčlenjevalnik vozlišč)](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter (Razdeljevalec stavkov)](../../api/classes/SentenceSplitter.md)

"
