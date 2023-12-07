---
sidebar_position: 3
---

# NodeParser

`Táto dokumentácia bola automaticky preložená a môže obsahovať chyby. Neváhajte otvoriť Pull Request na navrhnutie zmien.`

`NodeParser` v LlamaIndexe je zodpovedný za rozdelenie objektov `Document` na jednoduchšie spravovateľné objekty `Node`. Keď zavoláte `.fromDocuments()`, automaticky sa použije `NodeParser` z `ServiceContextu` na to, aby to urobil za vás. Alternatívne ho môžete použiť na rozdelenie dokumentov vopred.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Mám 10 rokov. John má 20 rokov." }),
]);
```

## TextSplitter

Podkladový textový rozdeľovač rozdelí text na vety. Môže sa tiež použiť ako samostatný modul na rozdelenie surového textu.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Ahoj svet");
```

## API Referencia

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)

"
