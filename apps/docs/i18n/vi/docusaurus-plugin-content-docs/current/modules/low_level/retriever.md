---
sidebar_position: 5
---

# Retriever (Trình lấy dữ liệu)

`Tài liệu này đã được dịch tự động và có thể chứa lỗi. Đừng ngần ngại mở một Pull Request để đề xuất thay đổi.`

Trong LlamaIndex, một retriever là công cụ được sử dụng để lấy các `Node` từ một chỉ mục bằng cách sử dụng một chuỗi truy vấn. Một `VectorIndexRetriever` sẽ lấy các node tương tự nhất theo thứ tự top-k. Trong khi đó, một `SummaryIndexRetriever` sẽ lấy tất cả các node mà không quan trọng truy vấn.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// Lấy các node!
const nodesWithScore = await retriever.retrieve("chuỗi truy vấn");
```

## Tài liệu tham khảo API

- [SummaryIndexRetriever (Trình lấy dữ liệu chỉ mục tóm tắt)](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever (Trình lấy dữ liệu chỉ mục tóm tắt LLM)](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever (Trình lấy dữ liệu chỉ mục vector)](../../api/classes/VectorIndexRetriever.md)
