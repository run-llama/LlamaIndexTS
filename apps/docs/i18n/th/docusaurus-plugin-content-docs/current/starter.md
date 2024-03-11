---
sidebar_position: 2
---

# คู่มือเริ่มต้น

`เอกสารนี้ได้รับการแปลโดยอัตโนมัติและอาจมีข้อผิดพลาด อย่าลังเลที่จะเปิด Pull Request เพื่อแนะนำการเปลี่ยนแปลง.`

เมื่อคุณ[ติดตั้ง LlamaIndex.TS โดยใช้ NPM](installation)และตั้งค่าคีย์ OpenAI ของคุณเสร็จสิ้น คุณพร้อมที่จะเริ่มต้นแอปพลิเคชันครั้งแรกของคุณแล้ว:

ในโฟลเดอร์ใหม่:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # หากจำเป็น
```

สร้างไฟล์ `example.ts` โค้ดนี้จะโหลดข้อมูลตัวอย่างบางส่วน สร้างเอกสาร ดัชนี (ซึ่งสร้างเอมเบดด้วย OpenAI) และจากนั้นสร้างเครื่องมือค้นหาเพื่อตอบคำถามเกี่ยวกับข้อมูล

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // โหลดเอสเซย์จาก abramov.txt ใน Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // สร้างออบเจ็กต์เอกสารด้วยเอสเซย์
  const document = new Document({ text: essay });

  // แยกข้อความและสร้างเอมเบด จัดเก็บใน VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // ค้นหาดัชนี
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query(
    "ผู้เขียนทำอะไรในช่วงเวลาที่เขาเรียนมหาวิทยาลัย?",
  );

  // แสดงผลลัพธ์
  console.log(response.toString());
}

main();
```

จากนั้นคุณสามารถเรียกใช้ได้โดยใช้

```bash
npx ts-node example.ts
```

พร้อมที่จะเรียนรู้เพิ่มเติมหรือไม่? ดู NextJS playground ของเราได้ที่ https://llama-playground.vercel.app/ แหล่งที่มาสามารถดูได้ที่ https://github.com/run-llama/ts-playground

"
