---
sidebar_position: 0
---

# LLM (ภาษาธรรมชาติและการตอบสนอง)

`เอกสารนี้ได้รับการแปลโดยอัตโนมัติและอาจมีข้อผิดพลาด อย่าลังเลที่จะเปิด Pull Request เพื่อแนะนำการเปลี่ยนแปลง.`

LLM รับผิดชอบในการอ่านข้อความและสร้างการตอบสนองทางภาษาธรรมชาติสำหรับคำถามต่างๆ โดยค่าเริ่มต้น LlamaIndex.TS ใช้ `gpt-3.5-turbo`.

LLM สามารถตั้งค่าได้โดยชัดเจนในอ็อบเจกต์ `ServiceContext`.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## การอ้างอิง API

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
