---
sidebar_position: 3
---

# NodeParser

`Tài liệu này đã được dịch tự động và có thể chứa lỗi. Đừng ngần ngại mở một Pull Request để đề xuất thay đổi.`

`NodeParser` trong LlamaIndex có trách nhiệm chia các đối tượng `Document` thành các đối tượng `Node` dễ quản lý hơn. Khi bạn gọi `.fromDocuments()`, `NodeParser` từ `ServiceContext` được sử dụng để tự động thực hiện điều này cho bạn. Hoặc bạn cũng có thể sử dụng nó để chia tài liệu trước.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Tôi 10 tuổi. John 20 tuổi." }),
]);
```

## TextSplitter

Bộ chia văn bản cơ bản sẽ chia văn bản thành các câu. Nó cũng có thể được sử dụng như một module độc lập để chia văn bản thô.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Xin chào thế giới");
```

## Tài liệu API

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)

"
