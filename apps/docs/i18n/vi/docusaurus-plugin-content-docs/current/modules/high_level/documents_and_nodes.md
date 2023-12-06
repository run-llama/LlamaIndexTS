---
sidebar_position: 0
---

# Tài liệu và Node

`Tài liệu này đã được dịch tự động và có thể chứa lỗi. Đừng ngần ngại mở một Pull Request để đề xuất thay đổi.`

`Document` và `Node` là những khối xây dựng cơ bản của bất kỳ chỉ mục nào. Trong khi API cho các đối tượng này tương tự nhau, đối tượng `Document` đại diện cho toàn bộ tệp, trong khi `Node` là các phần nhỏ hơn của tài liệu gốc đó, phù hợp cho LLM và Q&A.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "text", metadata: { key: "val" } });
```

## Tài liệu tham khảo API

- [Document](../../api/classes/Document.md)
- [TextNode](../../api/classes/TextNode.md)
