---
sidebar_position: 3
---

# QueryEngine (เครื่องมือสอบถาม)

`เอกสารนี้ได้รับการแปลโดยอัตโนมัติและอาจมีข้อผิดพลาด อย่าลังเลที่จะเปิด Pull Request เพื่อแนะนำการเปลี่ยนแปลง.`

เครื่องมือสอบถาม (QueryEngine) คือการห่อหุ้ม `Retriever` และ `ResponseSynthesizer` เข้าด้วยกันเป็นท่อ (pipeline) ซึ่งจะใช้สตริงคำค้นหาเพื่อเรียกข้อมูลโหนดแล้วส่งไปยัง LLM เพื่อสร้างคำตอบ

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("สตริงคำค้นหา");
```

## ตัวเครื่องสอบถามคำถามย่อย (Sub Question Query Engine)

แนวคิดพื้นฐานของตัวเครื่องสอบถามคำถามย่อย (Sub Question Query Engine) คือการแบ่งคำถามเดียวเป็นหลายคำถาม แล้วรับคำตอบสำหรับแต่ละคำถามเหล่านั้น แล้วรวมคำตอบที่แตกต่างกันเป็นคำตอบเดียวสำหรับผู้ใช้ คุณสามารถคิดเกี่ยวกับมันเป็นเทคนิค "คิดให้ดีขึ้นขั้นตอนละขั้น" แต่วนซ้ำข้อมูลต้นทางของคุณ!

### เริ่มต้นใช้งาน

วิธีที่ง่ายที่สุดในการเริ่มลองใช้งานเครื่องมือสอบถามคำถามย่อย (Sub Question Query Engine) คือการเรียกใช้ไฟล์ subquestion.ts ในโฟลเดอร์ [examples](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

"

### เครื่องมือ

ตัวเครื่องสอบถามคำถามย่อย (SubQuestionQueryEngine) ถูกนำมาใช้งานด้วยเครื่องมือ (Tools) แนวคิดพื้นฐานของเครื่องมือ (Tools) คือเครื่องมือที่สามารถใช้งานได้สำหรับโมเดลภาษาขนาดใหญ่ ในกรณีนี้ SubQuestionQueryEngine ของเราพึ่ง QueryEngineTool ซึ่งเป็นเครื่องมือในการเรียกใช้คำถามบน QueryEngine นี้ สิ่งนี้ช่วยให้เราสามารถให้โมเดลมีตัวเลือกในการสอบถามเอกสารต่าง ๆ สำหรับคำถามต่าง ๆ ตัวอย่างเช่น คุณยังสามารถจินตนาการได้ว่า SubQuestionQueryEngine อาจใช้เครื่องมือที่ค้นหาสิ่งใดบนเว็บหรือรับคำตอบโดยใช้ Wolfram Alpha

คุณสามารถเรียนรู้เพิ่มเติมเกี่ยวกับเครื่องมือได้โดยดูที่เอกสาร LlamaIndex Python ที่ https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

"

## อ้างอิง API

- [RetrieverQueryEngine (เครื่องมือสอบถาม Retriever)](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine (เครื่องมือสอบถาม SubQuestion)](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool (เครื่องมือสอบถาม QueryEngine)](../../api/interfaces/QueryEngineTool.md)

"
