---
sidebar_position: 4
---

# Ví dụ từ đầu đến cuối

`Tài liệu này đã được dịch tự động và có thể chứa lỗi. Đừng ngần ngại mở một Pull Request để đề xuất thay đổi.`

Chúng tôi bao gồm một số ví dụ từ đầu đến cuối sử dụng LlamaIndex.TS trong kho lưu trữ

Hãy xem các ví dụ dưới đây hoặc thử chúng và hoàn thành chúng trong vài phút với hướng dẫn tương tác Github Codespace được cung cấp bởi Dev-Docs [tại đây](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Bộ máy trò chuyện](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Đọc một tệp và trò chuyện về nó với LLM.

## [Chỉ số Vector](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Tạo một chỉ số vector và truy vấn nó. Chỉ số vector sẽ sử dụng nhúng để lấy các nút liên quan nhất hàng đầu k. Mặc định, k hàng đầu là 2.

"

## [Chỉ mục Tóm tắt](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Tạo một chỉ mục danh sách và truy vấn nó. Ví dụ này cũng sử dụng `LLMRetriever`, sẽ sử dụng LLM để chọn các nút tốt nhất để sử dụng khi tạo câu trả lời.

"

## [Lưu / Tải một Chỉ mục](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Tạo và tải một chỉ mục vector. Việc lưu trữ vào đĩa trong LlamaIndex.TS xảy ra tự động khi một đối tượng ngữ cảnh lưu trữ được tạo ra.

"

## [Chỉ số Vector Tùy chỉnh](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Tạo một chỉ số vector và truy vấn nó, đồng thời cấu hình `LLM`, `ServiceContext` và `similarity_top_k`.

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Tạo một OpenAI LLM và sử dụng nó trực tiếp để trò chuyện.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Tạo một Llama-2 LLM và sử dụng nó trực tiếp cho cuộc trò chuyện.

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Sử dụng `SubQuestionQueryEngine`, nó chia các truy vấn phức tạp thành nhiều câu hỏi nhỏ, sau đó tổng hợp phản hồi từ các câu trả lời của tất cả các câu hỏi con.

"

## [Các mô-đun cấp thấp](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Ví dụ này sử dụng một số thành phần cấp thấp, loại bỏ nhu cầu sử dụng một công cụ truy vấn thực tế. Các thành phần này có thể được sử dụng ở bất kỳ đâu, trong bất kỳ ứng dụng nào, hoặc tùy chỉnh và phụ lớp để đáp ứng nhu cầu của riêng bạn.
