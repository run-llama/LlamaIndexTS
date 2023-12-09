---
sidebar_position: 2
---

# 索引

索引是您数据的基本容器和组织方式。LlamaIndex.TS 支持两种索引：

- `VectorStoreIndex` - 在生成响应时会向LLM发送前k个`Node`。默认的前k值是2。
- `SummaryIndex` - 在生成响应时会将索引中的每个`Node`发送给LLM

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## API 参考

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
