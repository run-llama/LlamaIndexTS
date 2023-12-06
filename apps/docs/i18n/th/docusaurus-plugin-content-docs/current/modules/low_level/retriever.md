---
sidebar_position: 5
---

# Retriever (ตัวเรียกคืน)

`เอกสารนี้ได้รับการแปลโดยอัตโนมัติและอาจมีข้อผิดพลาด อย่าลังเลที่จะเปิด Pull Request เพื่อแนะนำการเปลี่ยนแปลง.`

Retriever ใน LlamaIndex คือสิ่งที่ใช้ในการเรียกคืน `Node` จากดัชนีโดยใช้ query string ซึ่ง `VectorIndexRetriever` จะเรียกคืนโหนดที่คล้ายกันที่สุด top-k ในขณะที่ `SummaryIndexRetriever` จะเรียกคืนโหนดทั้งหมดไม่ว่าจะเป็น query อะไร

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// เรียกคืนโหนด!
const nodesWithScore = await retriever.retrieve("query string");
```

## API Reference (การอ้างอิง API)

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)
