---
sidebar_position: 0
---

# เอกสารและโหนด

`เอกสารนี้ได้รับการแปลโดยอัตโนมัติและอาจมีข้อผิดพลาด อย่าลังเลที่จะเปิด Pull Request เพื่อแนะนำการเปลี่ยนแปลง.`

`เอกสาร (Document)` และ `โหนด (Node)` เป็นองค์ประกอบพื้นฐานของดัชนีใด ๆ ในการเข้าถึง API สำหรับออบเจ็กต์เหล่านี้คล้ายกัน ออบเจ็กต์ `เอกสาร (Document)` แทนไฟล์ทั้งหมดในขณะที่ `โหนด (Node)` เป็นส่วนย่อยของเอกสารต้นฉบับนั้น ที่เหมาะสำหรับการใช้ใน LLM และ Q&A

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "ข้อความ", metadata: { key: "val" } });
```

## การอ้างอิง API

- [เอกสาร (Document)](../../api/classes/Document.md)
- [โหนดข้อความ (TextNode)](../../api/classes/TextNode.md)

"
