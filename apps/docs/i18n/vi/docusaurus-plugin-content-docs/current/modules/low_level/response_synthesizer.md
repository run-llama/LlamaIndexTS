---
sidebar_position: 6
---

# ResponseSynthesizer (Trình tổng hợp phản hồi)

`Tài liệu này đã được dịch tự động và có thể chứa lỗi. Đừng ngần ngại mở một Pull Request để đề xuất thay đổi.`

ResponseSynthesizer là trách nhiệm của việc gửi truy vấn, các nút và mẫu gợi ý đến LLM để tạo ra một phản hồi. Có một số chế độ chính để tạo ra một phản hồi:

- `Refine` (Tinh chỉnh): "tạo và tinh chỉnh" một câu trả lời bằng cách lần lượt đi qua từng đoạn văn bản được truy xuất. Điều này tạo ra một cuộc gọi LLM riêng cho mỗi Node. Tốt cho các câu trả lời chi tiết hơn.
- `CompactAndRefine` (Nén và tinh chỉnh) (mặc định): "nén" gợi ý trong mỗi cuộc gọi LLM bằng cách đưa vào càng nhiều đoạn văn bản nào có thể vừa với kích thước gợi ý tối đa. Nếu có quá nhiều đoạn văn bản để đưa vào một gợi ý, "tạo và tinh chỉnh" một câu trả lời bằng cách đi qua nhiều gợi ý nén. Tương tự như `refine`, nhưng sẽ giảm số lượng cuộc gọi LLM.
- `TreeSummarize` (Tóm tắt cây): Dựa trên một tập hợp các đoạn văn bản và truy vấn, đệ quy xây dựng một cây và trả về nút gốc là phản hồi. Tốt cho mục đích tóm tắt.
- `SimpleResponseBuilder` (Trình xây dựng phản hồi đơn giản): Dựa trên một tập hợp các đoạn văn bản và truy vấn, áp dụng truy vấn cho mỗi đoạn văn bản trong khi tích lũy các phản hồi vào một mảng. Trả về một chuỗi ghép nối của tất cả các phản hồi. Tốt khi bạn cần chạy truy vấn giống nhau độc lập cho mỗi đoạn văn bản.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "Tôi 10 tuổi." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "John 20 tuổi." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "Tôi bao nhiêu tuổi?",
  nodesWithScore,
);
console.log(response.response);
```

## Tài liệu API

- [ResponseSynthesizer (Trình tổng hợp phản hồi)](../../api/classes/ResponseSynthesizer.md)
- [Refine (Tinh chỉnh)](../../api/classes/Refine.md)
- [CompactAndRefine (Nén và tinh chỉnh)](../../api/classes/CompactAndRefine.md)
- [TreeSummarize (Tóm tắt cây)](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder (Trình xây dựng phản hồi đơn giản)](../../api/classes/SimpleResponseBuilder.md)

"
