---
sidebar_position: 2
---

# 索引

索引是您的数据的基本容器和组织方式。LlamaIndex.TS支持两种索引：

- `VectorStoreIndex` - 在生成响应时将前k个`Node`发送到LLM。默认的前k个值为2。
- `SummaryIndex` - 将索引中的每个`Node`按顺序发送到LLM，以生成响应。

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## API 参考

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)
