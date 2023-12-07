---
sidebar_position: 1
---

# Nhúng (Embedding)

`Tài liệu này đã được dịch tự động và có thể chứa lỗi. Đừng ngần ngại mở một Pull Request để đề xuất thay đổi.`

Mô hình nhúng trong LlamaIndex có trách nhiệm tạo ra biểu diễn số học của văn bản. Mặc định, LlamaIndex sẽ sử dụng mô hình `text-embedding-ada-002` từ OpenAI.

Điều này có thể được thiết lập rõ ràng trong đối tượng `ServiceContext`.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## Tài liệu tham khảo API

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
