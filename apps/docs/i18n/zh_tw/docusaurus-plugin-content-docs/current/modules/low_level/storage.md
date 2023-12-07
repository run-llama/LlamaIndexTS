---
sidebar_position: 7
---

# 儲存 (Storage)

`此文件已自動翻譯，可能包含錯誤。如有更改建議，請毫不猶豫地提交 Pull Request。`

在 LlamaIndex.TS 中，一旦您配置了 `StorageContext` 物件，儲存就會自動運作。只需配置 `persistDir` 並將其附加到索引即可。

目前，只支援從磁碟儲存和載入，未來將會有更多整合計劃！

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "測試文字" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## API 參考 (API Reference)

- [儲存上下文 (StorageContext)](../../api/interfaces/StorageContext.md)
