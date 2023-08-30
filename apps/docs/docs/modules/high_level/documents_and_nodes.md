---
sidebar_position: 0
---

# Documents and Nodes

`Document`s and `Node`s are the basic building blocks of any index. While the API for these objects is similar, `Document` objects represent entire files, while `Node`s are smaller pieces of that original document, that are suitable for an LLM and Q&A.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "text", metadata: { key: "val" } });
```

## API Reference

- [Document](../../api/classes/Document.md)
- [TextNode](../../api/classes/TextNode.md)
