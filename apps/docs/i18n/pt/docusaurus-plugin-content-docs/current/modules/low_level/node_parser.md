---
sidebar_position: 3
---

# NodeParser

`Esta documentação foi traduzida automaticamente e pode conter erros. Não hesite em abrir um Pull Request para sugerir alterações.`

O `NodeParser` no LlamaIndex é responsável por dividir objetos `Document` em objetos `Node` mais gerenciáveis. Quando você chama `.fromDocuments()`, o `NodeParser` do `ServiceContext` é usado para fazer isso automaticamente para você. Alternativamente, você pode usá-lo para dividir documentos antecipadamente.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Eu tenho 10 anos. John tem 20 anos." }),
]);
```

## TextSplitter

O divisor de texto subjacente dividirá o texto em frases. Ele também pode ser usado como um módulo independente para dividir texto bruto.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Olá Mundo");
```

## Referência da API

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)

"
