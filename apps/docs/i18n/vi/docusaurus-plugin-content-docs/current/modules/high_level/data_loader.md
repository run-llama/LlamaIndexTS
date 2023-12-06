---
sidebar_position: 1
---

# Đọc giả / Trình tải

`Tài liệu này đã được dịch tự động và có thể chứa lỗi. Đừng ngần ngại mở một Pull Request để đề xuất thay đổi.`

LlamaIndex.TS hỗ trợ việc tải dữ liệu từ thư mục một cách dễ dàng bằng cách sử dụng lớp `SimpleDirectoryReader`. Hiện tại, hỗ trợ các tệp `.txt`, `.pdf`, `.csv`, `.md` và `.docx`, và sẽ có thêm nhiều định dạng khác trong tương lai!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## Tài liệu tham khảo API

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)
