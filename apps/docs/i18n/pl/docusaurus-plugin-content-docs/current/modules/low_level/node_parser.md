---
sidebar_position: 3
---

# NodeParser

`Ta dokumentacja została przetłumaczona automatycznie i może zawierać błędy. Nie wahaj się otworzyć Pull Request, aby zaproponować zmiany.`

`NodeParser` w LlamaIndex jest odpowiedzialny za podział obiektów `Document` na bardziej zarządzalne obiekty `Node`. Gdy wywołasz `.fromDocuments()`, `NodeParser` z `ServiceContext` jest automatycznie używany do tego. Alternatywnie, możesz go użyć do podziału dokumentów z wyprzedzeniem.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Mam 10 lat. John ma 20 lat." }),
]);
```

## TextSplitter

Podstawowy podział tekstu dokonuje podziału tekstu na zdania. Może być również używany jako samodzielny moduł do podziału surowego tekstu.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Witaj Świecie");
```

"

## Dokumentacja API

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)

"
