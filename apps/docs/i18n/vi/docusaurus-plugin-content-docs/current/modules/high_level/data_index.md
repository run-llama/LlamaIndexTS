---
sidebar_position: 2
---

# Chỉ mục (Index)

`Tài liệu này đã được dịch tự động và có thể chứa lỗi. Đừng ngần ngại mở một Pull Request để đề xuất thay đổi.`

Một chỉ mục là một container cơ bản và tổ chức cho dữ liệu của bạn. LlamaIndex.TS hỗ trợ hai loại chỉ mục:

- `VectorStoreIndex` - sẽ gửi các `Node` hàng đầu đến LLM khi tạo ra một phản hồi. Giá trị mặc định của hàng đầu là 2.
- `SummaryIndex` - sẽ gửi mọi `Node` trong chỉ mục đến LLM để tạo ra một phản hồi.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## Tài liệu tham khảo API

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)
