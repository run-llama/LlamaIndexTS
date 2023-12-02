# 存储

一旦配置了 `StorageContext` 对象，LlamaIndex.TS 中的存储就会自动工作。只需配置 `persistDir` 并将其附加到索引即可。

目前，仅支持从磁盘保存和加载，未来将计划进行更多集成！

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Test Text" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## API 参考

- [StorageContext](../../api/interfaces/StorageContext.md)
