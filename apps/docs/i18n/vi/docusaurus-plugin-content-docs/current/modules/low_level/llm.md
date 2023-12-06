---
sidebar_position: 0
---

# LLM

`Tài liệu này đã được dịch tự động và có thể chứa lỗi. Đừng ngần ngại mở một Pull Request để đề xuất thay đổi.`

LLM (Llama Language Model) có nhiệm vụ đọc văn bản và tạo ra câu trả lời tự nhiên cho các truy vấn. Mặc định, LlamaIndex.TS sử dụng `gpt-3.5-turbo`.

LLM có thể được thiết lập rõ ràng trong đối tượng `ServiceContext`.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## Tài liệu tham khảo API

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
