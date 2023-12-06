---
sidebar_position: 0
---

# 文档和节点

`Document`（文档）和`Node`（节点）是任何索引的基本构建块。虽然这些对象的 API 相似，但`Document`对象代表整个文件，而`Node`则是原始文档的较小部分，适合用于LLM和Q&A。

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "text", metadata: { key: "val" } });
```

## API 参考

- [Document](../../api/classes/Document.md)
- [TextNode](../../api/classes/TextNode.md)
