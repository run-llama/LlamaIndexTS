# NodeParser

`NodeParser` 在 LlamaIndex 中负责将 `Document` 对象拆分为更易管理的 `Node` 对象。当您调用 `.fromDocuments()` 时，将使用 `ServiceContext` 中的 `NodeParser` 自动执行此操作。或者，您可以使用它提前拆分文档。

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "我今年10岁。约翰今年20岁。" }),
]);
```

## TextSplitter

底层的文本拆分器将按句子拆分文本。它也可以作为一个独立的模块来拆分原始文本。

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("你好世界");
```

## API 参考

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)
