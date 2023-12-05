---
sidebar_position: 7
---

# 存储

在配置了 `StorageContext` 对象后，LlamaIndex.TS 中的存储功能会自动工作。只需配置 `persistDir` 并将其附加到索引上。

目前，只支持从磁盘保存和加载数据，未来计划支持更多集成！

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

// 默认设置创建存储上下文
const storageContext = await storageContextFromDefaults({
  persistDir: "./storage", // 持久化目录
});

const document = new Document({ text: "Test Text" }); // 创建文档
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext, // 使用存储上下文
});
```

## API 参考

- [StorageContext](../../api/interfaces/StorageContext.md)
