---
sidebar_position: 3
---

# NodeParser (Analizador de Nodos)

`Esta documentación ha sido traducida automáticamente y puede contener errores. No dudes en abrir una Pull Request para sugerir cambios.`

El `NodeParser` en LlamaIndex es responsable de dividir los objetos `Document` en objetos `Node` más manejables. Cuando llamas a `.fromDocuments()`, el `NodeParser` del `ServiceContext` se utiliza automáticamente para hacer esto por ti. Alternativamente, puedes usarlo para dividir documentos de antemano.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Tengo 10 años. John tiene 20 años." }),
]);
```

## TextSplitter (Divisor de Texto)

El divisor de texto subyacente dividirá el texto por oraciones. También se puede utilizar como un módulo independiente para dividir texto sin formato.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Hola Mundo");
```

## Referencia de la API

- [SimpleNodeParser (Analizador de Nodos Simple)](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter (Divisor de Oraciones)](../../api/classes/SentenceSplitter.md)

"
