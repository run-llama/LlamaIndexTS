---
sidebar_position: 2
---

# 索引 (Index)

`此文件已自動翻譯，可能包含錯誤。如有更改建議，請毫不猶豫地提交 Pull Request。`

索引是您的数据的基本容器和组织方式。LlamaIndex.TS 支持两种索引：

- `VectorStoreIndex` - 在生成响应时，将发送前 k 个 `Node` 到 LLM。默认的 k 值为 2。
- `SummaryIndex` - 将发送索引中的每个 `Node` 到 LLM 以生成响应。

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## API 参考 (API Reference)

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
