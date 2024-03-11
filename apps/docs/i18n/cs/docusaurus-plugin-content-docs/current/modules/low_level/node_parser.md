---
sidebar_position: 3
---

# NodeParser (Parsování uzlů)

`Tato dokumentace byla automaticky přeložena a může obsahovat chyby. Neváhejte otevřít Pull Request pro navrhování změn.`

`NodeParser` v LlamaIndexu je zodpovědný za rozdělování objektů `Document` na snadno zpracovatelné objekty `Node`. Když zavoláte `.fromDocuments()`, `NodeParser` z `ServiceContextu` je automaticky použit k tomu, aby to udělal za vás. Alternativně ho můžete použít k rozdělení dokumentů předem.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Je mi 10 let. Johnovi je 20 let." }),
]);
```

## TextSplitter

Podkladový textový rozdělovač rozdělí text na věty. Může být také použit jako samostatný modul pro rozdělení čistého textu.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Ahoj světe");
```

## API Reference (Odkazy na API)

- [SimpleNodeParser (Jednoduchý parsovací uzel)](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter (Rozdělovač vět)](../../api/classes/SentenceSplitter.md)

"
