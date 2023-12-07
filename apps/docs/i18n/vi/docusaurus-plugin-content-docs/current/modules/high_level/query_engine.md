---
sidebar_position: 3
---

# QueryEngine (Trình truy vấn)

`Tài liệu này đã được dịch tự động và có thể chứa lỗi. Đừng ngần ngại mở một Pull Request để đề xuất thay đổi.`

Một trình truy vấn bao gồm một `Retriever` và một `ResponseSynthesizer` trong một đường ống, sẽ sử dụng chuỗi truy vấn để truy xuất các nút và sau đó gửi chúng đến LLM để tạo ra một phản hồi.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("chuỗi truy vấn");
```

## Trình truy vấn Câu hỏi phụ

Khái niệm cơ bản của Trình truy vấn Câu hỏi phụ là chia một truy vấn duy nhất thành nhiều truy vấn, lấy câu trả lời cho mỗi truy vấn đó, và sau đó kết hợp các câu trả lời khác nhau thành một phản hồi duy nhất cho người dùng. Bạn có thể nghĩ đến nó như là kỹ thuật "suy nghĩ từng bước" nhưng lặp lại qua các nguồn dữ liệu của bạn!

### Bắt đầu

Cách đơn giản nhất để bắt đầu thử Trình truy vấn Câu hỏi phụ là chạy tệp subquestion.ts trong [examples](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

### Công cụ

Trình truy vấn Câu hỏi phụ được triển khai với Công cụ. Ý tưởng cơ bản của Công cụ là chúng là các tùy chọn thực thi cho mô hình ngôn ngữ lớn. Trong trường hợp này, Trình truy vấn Câu hỏi phụ của chúng tôi phụ thuộc vào QueryEngineTool, một công cụ để chạy các truy vấn trên một Trình truy vấn. Điều này cho phép chúng tôi cung cấp cho mô hình một tùy chọn để truy vấn các tài liệu khác nhau cho các câu hỏi khác nhau ví dụ. Bạn cũng có thể tưởng tượng rằng Trình truy vấn Câu hỏi phụ có thể sử dụng một Công cụ để tìm kiếm một cái gì đó trên web hoặc lấy một câu trả lời bằng cách sử dụng Wolfram Alpha.

Bạn có thể tìm hiểu thêm về Công cụ bằng cách xem tài liệu Python LlamaIndex tại https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## Tài liệu tham khảo API

- [RetrieverQueryEngine (Trình truy vấn Retriever)](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine (Trình truy vấn SubQuestion)](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool (Công cụ Trình truy vấn)](../../api/interfaces/QueryEngineTool.md)
