---
sidebar_position: 1
---

# การฝัง (Embedding)

`เอกสารนี้ได้รับการแปลโดยอัตโนมัติและอาจมีข้อผิดพลาด อย่าลังเลที่จะเปิด Pull Request เพื่อแนะนำการเปลี่ยนแปลง.`

โมเดลการฝังใน LlamaIndex รับผิดชอบในการสร้างการแสดงตัวเลขของข้อความ โดยค่าเริ่มต้น LlamaIndex จะใช้โมเดล `text-embedding-ada-002` จาก OpenAI

สามารถตั้งค่าได้โดยชัดเจนในอ็อบเจ็กต์ `ServiceContext`

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## การอ้างอิง API

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
