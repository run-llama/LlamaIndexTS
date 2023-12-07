---
sidebar_position: 3
---

# NodeParser

`Ova dokumentacija je automatski prevedena i može sadržavati greške. Ne ustručavajte se otvoriti Pull Request za predlaganje promjena.`

`NodeParser` u LlamaIndexu je odgovoran za razdvajanje objekata `Document` u lakše upravljive objekte `Node`. Kada pozovete `.fromDocuments()`, `NodeParser` iz `ServiceContext`-a se automatski koristi da to učini za vas. Alternativno, možete ga koristiti da unaprijed razdvojite dokumente.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Imam 10 godina. John ima 20 godina." }),
]);
```

## TextSplitter

Osnovni tekstualni razdjelnik će razdvojiti tekst po rečenicama. Može se također koristiti kao samostalni modul za razdvajanje sirovog teksta.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Pozdrav svijete");
```

"

## API Referenca

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)

"
