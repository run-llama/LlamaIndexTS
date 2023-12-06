---
sidebar_position: 3
---

# NodeParser

`Bu belge otomatik olarak çevrilmiştir ve hatalar içerebilir. Değişiklik önermek için bir Pull Request açmaktan çekinmeyin.`

`NodeParser`, LlamaIndex içinde `Document` nesnelerini daha yönetilebilir `Node` nesnelerine bölen bir bileşendir. `.fromDocuments()` çağrıldığında, `ServiceContext` içindeki `NodeParser` otomatik olarak bunu yapmak için kullanılır. Alternatif olarak, belgeleri önceden bölmek için de kullanabilirsiniz.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Ben 10 yaşındayım. John 20 yaşındadır." }),
]);
```

## TextSplitter

Altta yatan metin bölücü, metni cümlelere göre böler. Ayrıca ham metni bölmek için bağımsız bir modül olarak da kullanılabilir.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Merhaba Dünya");
```

"

## API Referansı

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)

"
