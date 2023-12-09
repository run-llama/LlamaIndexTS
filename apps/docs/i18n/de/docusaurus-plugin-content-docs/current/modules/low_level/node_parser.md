---
sidebar_position: 3
---

# NodeParser

`Diese Dokumentation wurde automatisch übersetzt und kann Fehler enthalten. Zögern Sie nicht, einen Pull Request zu öffnen, um Änderungen vorzuschlagen.`

Der `NodeParser` in LlamaIndex ist dafür verantwortlich, `Document`-Objekte in handlichere `Node`-Objekte aufzuteilen. Wenn Sie `.fromDocuments()` aufrufen, wird automatisch der `NodeParser` aus dem `ServiceContext` verwendet, um dies für Sie zu erledigen. Alternativ können Sie ihn verwenden, um Dokumente im Voraus aufzuteilen.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Ich bin 10 Jahre alt. John ist 20 Jahre alt." }),
]);
```

## TextSplitter

Der zugrunde liegende Textsplitter teilt den Text in Sätze auf. Er kann auch als eigenständiges Modul zum Aufteilen von Rohtext verwendet werden.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Hallo Welt");
```

## API-Referenz

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)

"
