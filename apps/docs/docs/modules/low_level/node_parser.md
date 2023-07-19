---
sidebar_position: 3
---

# NodeParser

The `NodeParser` in LlamaIndex is responbile for splitting `Document` objects into more manageable `Node` objects. When you call `.fromDocuments()`, the `NodeParser` from the `ServiceContext` is used to do this automatically for you. Alternatively, you can use it to split documents ahead of time.

```typescript
import {
  Document,
  SimpleNodeParser,
} from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "I am 10 years old. John is 20 years old." }),
]);
```

## TextSplitter

The underlying text splitter will split text by sentences. It can also be used as a standalone module for splitting raw text.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1, });

const textSplits = splitter.splitText("Hello World");
```

## API Reference

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)
