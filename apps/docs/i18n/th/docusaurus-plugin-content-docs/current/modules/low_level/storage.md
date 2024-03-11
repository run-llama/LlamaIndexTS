---
sidebar_position: 7
---

# การจัดเก็บข้อมูล (Storage)

`เอกสารนี้ได้รับการแปลโดยอัตโนมัติและอาจมีข้อผิดพลาด อย่าลังเลที่จะเปิด Pull Request เพื่อแนะนำการเปลี่ยนแปลง.`

การจัดเก็บข้อมูลใน LlamaIndex.TS ทำงานอัตโนมัติเมื่อคุณกำหนดค่า `StorageContext` object แล้ว แค่กำหนดค่า `persistDir` และเชื่อมต่อกับดัชนี

ในขณะนี้เราสนับสนุนการบันทึกและโหลดข้อมูลจากดิสก์เท่านั้น แต่ยังมีการรวมระบบอื่นๆ ในอนาคต!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Test Text" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## การอ้างอิง API (API Reference)

- [StorageContext](../../api/interfaces/StorageContext.md)
