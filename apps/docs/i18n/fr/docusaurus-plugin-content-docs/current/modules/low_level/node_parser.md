---
sidebar_position: 3
---

# NodeParser

Le `NodeParser` dans LlamaIndex est responsable de la division des objets `Document` en objets `Node` plus gérables. Lorsque vous appelez `.fromDocuments()`, le `NodeParser` du `ServiceContext` est utilisé pour le faire automatiquement pour vous. Alternativement, vous pouvez l'utiliser pour diviser les documents à l'avance.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "J'ai 10 ans. John a 20 ans." }),
]);
```

## TextSplitter

Le diviseur de texte sous-jacent divisera le texte par phrases. Il peut également être utilisé en tant que module autonome pour diviser du texte brut.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Bonjour le monde");
```

## Référence de l'API

- [SimpleNodeParser](../../api/classes/SimpleNodeParser)
- [SentenceSplitter](../../api/classes/SentenceSplitter)
