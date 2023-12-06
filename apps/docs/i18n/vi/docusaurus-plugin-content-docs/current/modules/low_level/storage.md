---
sidebar_position: 7
---

# Lưu trữ (Storage)

`Tài liệu này đã được dịch tự động và có thể chứa lỗi. Đừng ngần ngại mở một Pull Request để đề xuất thay đổi.`

Lưu trữ trong LlamaIndex.TS hoạt động tự động sau khi bạn đã cấu hình đối tượng `StorageContext`. Chỉ cần cấu hình `persistDir` và gắn nó vào một chỉ mục.

Hiện tại, chỉ hỗ trợ lưu và tải từ đĩa, với các tích hợp trong tương lai được lên kế hoạch!

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

## Tài liệu tham khảo API

- [StorageContext](../../api/interfaces/StorageContext.md)
