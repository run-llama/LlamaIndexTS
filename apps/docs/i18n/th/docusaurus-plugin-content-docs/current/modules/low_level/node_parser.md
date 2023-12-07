---
sidebar_position: 3
---

# NodeParser (ตัวแยกโหนด)

`เอกสารนี้ได้รับการแปลโดยอัตโนมัติและอาจมีข้อผิดพลาด อย่าลังเลที่จะเปิด Pull Request เพื่อแนะนำการเปลี่ยนแปลง.`

`NodeParser` ใน LlamaIndex รับผิดชอบในการแบ่ง `Document` เป็น `Node` ที่จัดการได้ง่ายมากขึ้น เมื่อคุณเรียกใช้ `.fromDocuments()` `NodeParser` จาก `ServiceContext` จะถูกใช้งานเพื่อทำให้งานนี้เป็นอัตโนมัติสำหรับคุณ หรือถ้าคุณต้องการคุณสามารถใช้งานเพื่อแบ่งเอกสารล่วงหน้าได้

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "ฉันอายุ 10 ปี จอห์นอายุ 20 ปี" }),
]);
```

## TextSplitter (ตัวแยกข้อความ)

ตัวแยกข้อความในฐานะพื้นฐานจะแยกข้อความตามประโยค สามารถใช้เป็นโมดูลแยกข้อความเปล่าๆ ได้เช่นกัน

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("สวัสดีชาวโลก");
```

"

## API Reference (การอ้างอิง API)

- [SimpleNodeParser (ตัวแยกโหนดแบบง่าย)](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter (ตัวแยกประโยค)](../../api/classes/SentenceSplitter.md)

"
