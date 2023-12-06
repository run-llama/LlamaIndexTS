---
sidebar_position: 6
---

# ResponseSynthesizer (ตัวสังเคราะห์การตอบกลับ)

`เอกสารนี้ได้รับการแปลโดยอัตโนมัติและอาจมีข้อผิดพลาด อย่าลังเลที่จะเปิด Pull Request เพื่อแนะนำการเปลี่ยนแปลง.`

ResponseSynthesizer มีหน้าที่ส่งคำถาม, โหนด และแม่แบบข้อความให้กับ LLM เพื่อสร้างคำตอบ มีโหมดหลักๆ สำหรับการสร้างคำตอบดังนี้:

- `Refine` (ปรับปรุง): "สร้างและปรับปรุง" คำตอบโดยการไปทีละชิ้นข้อความที่ได้รับ
  สร้างการเรียก LLM แยกตามโหนด ใช้สำหรับคำตอบที่ละเอียดมากขึ้น
- `CompactAndRefine` (คอมแพ็คและปรับปรุง) (ค่าเริ่มต้น): "คอมแพ็ค" แม่แบบระหว่างการเรียก LLM โดยการเติมข้อความที่จะพอดีกับขนาดของแม่แบบสูงสุด หากมีข้อความมากเกินไปที่จะเติมในแม่แบบเดียว ให้ "สร้างและปรับปรุง" คำตอบโดยไปทีละแม่แบบ คล้ายกับ `refine` แต่ควรจะทำให้มีการเรียก LLM น้อยลง
- `TreeSummarize` (สรุปต้นไม้): โดยให้ชุดข้อความและคำถาม สร้างต้นไม้และส่งโหนดรากเป็นคำตอบ ใช้สำหรับการสรุป
- `SimpleResponseBuilder` (สร้างคำตอบแบบง่าย): โดยให้ชุดข้อความและคำถาม นำคำถามไปใช้กับแต่ละข้อความ และสะสมคำตอบในอาร์เรย์ ส่งคืนสตริงที่ต่อกันของคำตอบทั้งหมด ใช้เมื่อต้องการเรียกคำถามเดียวกันต่อแต่ละข้อความ

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "ฉันอายุ 10 ปี" }),
    score: 1,
  },
  {
    node: new TextNode({ text: "จอห์นอายุ 20 ปี" }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "ฉันอายุเท่าไร?",
  nodesWithScore,
);
console.log(response.response);
```

## อ้างอิง API

- [ResponseSynthesizer](../../api/classes/ResponseSynthesizer.md)
- [Refine](../../api/classes/Refine.md)
- [CompactAndRefine](../../api/classes/CompactAndRefine.md)
- [TreeSummarize](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder](../../api/classes/SimpleResponseBuilder.md)

"
