---
sidebar_position: 3
---

# NodeParser 节点解析器

`NodeParser` 在 LlamaIndex 中负责将 `Document` 对象拆分成更易管理的 `Node` 对象。当你调用 `.fromDocuments()` 时，`ServiceContext` 中的 `NodeParser` 会自动为你完成这个操作。或者，你也可以提前使用它来拆分文档。

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "I am 10 years old. John is 20 years old." }),
]);
```

## TextSplitter 文本分割器

底层的文本分割器会按句子来分割文本。它也可以作为一个独立模块用于分割原始文本。

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Hello World");
```

## API 参考

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)
