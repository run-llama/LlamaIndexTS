---
sidebar_position: 2
---

# ดัชนี (Index)

`เอกสารนี้ได้รับการแปลโดยอัตโนมัติและอาจมีข้อผิดพลาด อย่าลังเลที่จะเปิด Pull Request เพื่อแนะนำการเปลี่ยนแปลง.`

ดัชนีเป็นคอนเทนเนอร์และการจัดระเบียบพื้นฐานสำหรับข้อมูลของคุณ LlamaIndex.TS สนับสนุนดัชนีสองประเภท:

- `VectorStoreIndex` - จะส่ง `Node` ที่ดีที่สุด k ไปยัง LLM เมื่อสร้างการตอบกลับ ค่าเริ่มต้นของ k คือ 2
- `SummaryIndex` - จะส่งทุก `Node` ในดัชนีไปยัง LLM เพื่อสร้างการตอบกลับ

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "ทดสอบ" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## การอ้างอิง API

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
