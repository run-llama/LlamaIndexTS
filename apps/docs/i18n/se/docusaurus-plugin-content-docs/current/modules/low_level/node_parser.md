---
sidebar_position: 3
---

# NodeParser

`Ova dokumentacija je automatski prevedena i može sadržati greške. Ne oklevajte da otvorite Pull Request za predlaganje izmena.`

`NodeParser` u LlamaIndex-u je odgovoran za deljenje objekata `Document` na lakše upravljive objekte `Node`. Kada pozovete `.fromDocuments()`, `NodeParser` iz `ServiceContext`-a se automatski koristi da to uradi za vas. Alternativno, možete ga koristiti da unapred podelite dokumente.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Imam 10 godina. Džon ima 20 godina." }),
]);
```

## TextSplitter

Osnovni delilac teksta će deliti tekst po rečenicama. Može se takođe koristiti kao samostalan modul za deljenje sirovog teksta.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Zdravo svete");
```

## API Referenca

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)

"
