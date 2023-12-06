---
sidebar_position: 3
---

# NodeParser

`Questa documentazione è stata tradotta automaticamente e può contenere errori. Non esitare ad aprire una Pull Request per suggerire modifiche.`

Il `NodeParser` in LlamaIndex è responsabile per suddividere gli oggetti `Document` in oggetti `Node` più gestibili. Quando chiami `.fromDocuments()`, il `NodeParser` dal `ServiceContext` viene utilizzato per farlo automaticamente per te. In alternativa, puoi usarlo per suddividere i documenti in anticipo.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Ho 10 anni. John ha 20 anni." }),
]);
```

## TextSplitter

Il text splitter sottostante dividerà il testo in frasi. Può anche essere utilizzato come modulo autonomo per dividere il testo grezzo.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Ciao Mondo");
```

## Riferimento API

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)

"
