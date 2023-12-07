---
sidebar_position: 1
---

# โมดูลอ่าน / โหลด

`เอกสารนี้ได้รับการแปลโดยอัตโนมัติและอาจมีข้อผิดพลาด อย่าลังเลที่จะเปิด Pull Request เพื่อแนะนำการเปลี่ยนแปลง.`

LlamaIndex.TS สนับสนุนการโหลดไฟล์จากโฟลเดอร์อย่างง่ายด้วยคลาส `SimpleDirectoryReader` ในปัจจุบันรองรับไฟล์ประเภท `.txt`, `.pdf`, `.csv`, `.md` และ `.docx` และยังมีแผนที่จะรองรับไฟล์อื่นๆ ในอนาคต!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## การอ้างอิง API

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)

"
