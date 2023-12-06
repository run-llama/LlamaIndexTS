---
sidebar_position: 0
---

# 文件和節點

`此文件已自動翻譯，可能包含錯誤。如有更改建議，請毫不猶豫地提交 Pull Request。`

`Document`和`Node`是任何索引的基本構建塊。雖然這些對象的API類似，但`Document`對象代表整個文件，而`Node`則是原始文件的較小片段，適用於LLM和Q&A。

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "text", metadata: { key: "val" } });
```

## API 參考

- [Document](../../api/classes/Document.md)
- [TextNode](../../api/classes/TextNode.md)

"
