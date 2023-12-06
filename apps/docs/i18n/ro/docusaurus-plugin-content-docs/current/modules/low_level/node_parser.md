---
sidebar_position: 3
---

# NodeParser

`Această documentație a fost tradusă automat și poate conține erori. Nu ezitați să deschideți un Pull Request pentru a sugera modificări.`

`NodeParser` în LlamaIndex este responsabil pentru împărțirea obiectelor `Document` în obiecte `Node` mai ușor de gestionat. Când apelați `.fromDocuments()`, `NodeParser` din `ServiceContext` este utilizat pentru a face acest lucru automat pentru dvs. Alternativ, îl puteți utiliza pentru a împărți documentele în avans.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Am 10 ani. John are 20 de ani." }),
]);
```

## TextSplitter

TextSplitter-ul subiacent va împărți textul în propoziții. Poate fi, de asemenea, utilizat ca un modul independent pentru împărțirea textului brut.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Salut, lume!");
```

## Referință API

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)

"
