---
sidebar_position: 3
---

# NodeParser (節點解析器)

`此文件已自動翻譯，可能包含錯誤。如有更改建議，請毫不猶豫地提交 Pull Request。`

在 LlamaIndex 中，`NodeParser` 負責將 `Document` 物件拆分成更易管理的 `Node` 物件。當您呼叫 `.fromDocuments()` 時，`ServiceContext` 中的 `NodeParser` 會自動為您執行此操作。或者，您也可以使用它提前拆分文件。

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "我今年10歲。約翰今年20歲。" }),
]);
```

## TextSplitter (文本拆分器)

底層的文本拆分器將根據句子將文本拆分。它也可以作為獨立模塊用於拆分原始文本。

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("你好世界");
```

## API 參考

- [SimpleNodeParser (簡單節點解析器)](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter (句子拆分器)](../../api/classes/SentenceSplitter.md)

"
