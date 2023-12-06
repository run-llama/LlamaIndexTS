---
sidebar_position: 4
---

# ตัวเครื่องสนทนา (ChatEngine)

`เอกสารนี้ได้รับการแปลโดยอัตโนมัติและอาจมีข้อผิดพลาด อย่าลังเลที่จะเปิด Pull Request เพื่อแนะนำการเปลี่ยนแปลง.`

ตัวเครื่องสนทนาเป็นวิธีที่รวดเร็วและง่ายในการสนทนากับข้อมูลในดัชนีของคุณ.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// เริ่มการสนทนา
const response = await chatEngine.chat(query);
```

## การอ้างอิง Api

- [ตัวเครื่องสนทนาแบบ ContextChatEngine](../../api/classes/ContextChatEngine.md)
- [ตัวเครื่องสนทนาแบบ CondenseQuestionChatEngine](../../api/classes/ContextChatEngine.md)

"
