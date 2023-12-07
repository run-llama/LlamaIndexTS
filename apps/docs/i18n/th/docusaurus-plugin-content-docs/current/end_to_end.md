---
sidebar_position: 4
---

# ตัวอย่าง End to End

`เอกสารนี้ได้รับการแปลโดยอัตโนมัติและอาจมีข้อผิดพลาด อย่าลังเลที่จะเปิด Pull Request เพื่อแนะนำการเปลี่ยนแปลง.`

เรามีตัวอย่าง End-to-End หลายรูปแบบที่ใช้ LlamaIndex.TS ในเรปอสิทอรี

ดูตัวอย่างด้านล่างหรือลองใช้งานและทำตามได้ในไม่กี่นาทีด้วยการสอนแบบ Github Codespace ที่ให้โดย Dev-Docs [ที่นี่](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Chat Engine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

อ่านไฟล์และพูดคุยเกี่ยวกับมันกับ LLM.

## [ดัชนีเวกเตอร์](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

สร้างดัชนีเวกเตอร์และสอบถามข้อมูล ดัชนีเวกเตอร์จะใช้การฝังรูปภาพเพื่อเรียกดูโหนดที่เกี่ยวข้องมากที่สุด k โหนด โดยค่าเริ่มต้นของ k คือ 2.

"

## [สรุปดัชนี](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

สร้างดัชนีรายการและสอบถามดัชนี ตัวอย่างนี้ยังใช้ `LLMRetriever` ซึ่งจะใช้ LLM เพื่อเลือกโหนดที่ดีที่สุดในการสร้างคำตอบ

"

## [บันทึก / โหลดดัชนี](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

สร้างและโหลดดัชนีเวกเตอร์ การบันทึกลงดิสก์ใน LlamaIndex.TS จะเกิดขึ้นโดยอัตโนมัติเมื่อมีการสร้างออบเจ็กต์ storage context

"

## [Customized Vector Index](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

สร้างดัชนีเวกเตอร์และสอบถามด้วยการกำหนดค่า `LLM`, `ServiceContext`, และ `similarity_top_k`

"

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

สร้าง OpenAI LLM และใช้งานได้โดยตรงสำหรับการสนทนา.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

สร้าง Llama-2 LLM และใช้งานได้โดยตรงสำหรับการสนทนา.

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

ใช้ `SubQuestionQueryEngine` ซึ่งแยกคำถามที่ซับซ้อนเป็นคำถามหลายๆ คำ แล้วรวมผลลัพธ์จากคำตอบของทุกคำถามย่อยเข้าด้วยกัน

"

## [โมดูลระดับต่ำ](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

ตัวอย่างนี้ใช้คอมโพเนนต์ระดับต่ำหลายอย่างซึ่งลดความจำเป็นในการใช้งานเครื่องมือค้นหาจริง คอมโพเนนต์เหล่านี้สามารถใช้ได้ทุกที่ในแอปพลิเคชันใดก็ได้ หรือปรับแต่งและสร้างคลาสย่อยเพื่อตอบสนองความต้องการของคุณเอง
