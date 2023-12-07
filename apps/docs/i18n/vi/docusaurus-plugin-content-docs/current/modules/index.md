# Các Module Cốt Lõi

`Tài liệu này đã được dịch tự động và có thể chứa lỗi. Đừng ngần ngại mở một Pull Request để đề xuất thay đổi.`

LlamaIndex.TS cung cấp một số module cốt lõi, được chia thành các module cấp cao để bắt đầu nhanh chóng và các module cấp thấp để tùy chỉnh các thành phần chính theo nhu cầu của bạn.

## Các Module Cấp Cao

- [**Document**](./high_level/documents_and_nodes.md): Một tài liệu đại diện cho một tệp văn bản, tệp PDF hoặc dữ liệu liên tục khác.

- [**Node**](./high_level/documents_and_nodes.md): Khối xây dựng dữ liệu cơ bản. Thông thường, đây là các phần của tài liệu được chia thành các phần quản lý nhỏ hơn có thể được đưa vào một mô hình nhúng và LLM.

- [**Reader/Loader**](./high_level/data_loader.md): Một reader hoặc loader là một cái gì đó nhận vào một tài liệu trong thế giới thực và chuyển đổi thành một lớp Document có thể được sử dụng trong Index và các truy vấn của bạn. Hiện tại, chúng tôi hỗ trợ các tệp văn bản thuần và PDF với nhiều tùy chọn khác nữa.

- [**Indexes**](./high_level/data_index.md): indexes lưu trữ các Node và các embedding của các node đó.

- [**QueryEngine**](./high_level/query_engine.md): Query engines là những gì tạo ra truy vấn bạn đưa vào và trả lại kết quả cho bạn. Query engines thường kết hợp một prompt được xây dựng sẵn với các node được chọn từ Index của bạn để cung cấp cho LLM ngữ cảnh cần thiết để trả lời truy vấn của bạn.

- [**ChatEngine**](./high_level/chat_engine.md): Một ChatEngine giúp bạn xây dựng một chatbot sẽ tương tác với Index của bạn.

## Module Cấp Thấp

- [**LLM**](./low_level/llm.md): Lớp LLM là một giao diện thống nhất cho một nhà cung cấp mô hình ngôn ngữ lớn như OpenAI GPT-4, Anthropic Claude hoặc Meta LLaMA. Bạn có thể kế thừa nó để viết một kết nối tới mô hình ngôn ngữ lớn của riêng bạn.

- [**Embedding**](./low_level/embedding.md): Một embedding được biểu diễn dưới dạng một vector các số thực. Mô hình embedding mặc định của chúng tôi là text-embedding-ada-002 của OpenAI và mỗi embedding mà nó tạo ra bao gồm 1.536 số thực. Một mô hình embedding phổ biến khác là BERT, sử dụng 768 số thực để biểu diễn mỗi Node. Chúng tôi cung cấp một số tiện ích để làm việc với embeddings bao gồm 3 tùy chọn tính toán độ tương đồng và Maximum Marginal Relevance.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): Chiến lược chia văn bản là rất quan trọng đối với hiệu suất tổng thể của tìm kiếm embedding. Hiện tại, mặc dù chúng tôi có một giá trị mặc định, nhưng không có một giải pháp phù hợp cho tất cả. Tùy thuộc vào tài liệu nguồn, bạn có thể muốn sử dụng các kích thước và chiến lược chia khác nhau. Hiện tại, chúng tôi hỗ trợ chia theo kích thước cố định, chia theo kích thước cố định với các phần giao nhau, chia theo câu và chia theo đoạn văn. Text splitter được sử dụng bởi NodeParser khi chia `Document` thành `Node`.

- [**Retriever**](./low_level/retriever.md): Retriever là thành phần thực sự chọn các Node để truy xuất từ chỉ mục. Ở đây, bạn có thể muốn thử truy xuất nhiều hoặc ít Node hơn cho mỗi truy vấn, thay đổi hàm tương đồng hoặc tạo retriever riêng cho mỗi trường hợp sử dụng cụ thể trong ứng dụng của bạn. Ví dụ, bạn có thể muốn có một retriever riêng cho nội dung mã nguồn so với nội dung văn bản.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): ResponseSynthesizer có trách nhiệm lấy một chuỗi truy vấn và sử dụng danh sách `Node` để tạo ra một phản hồi. Điều này có thể có nhiều hình thức, như lặp lại tất cả ngữ cảnh và làm rõ một câu trả lời, hoặc xây dựng một cây tóm tắt và trả về tóm tắt gốc.

- [**Storage**](./low_level/storage.md): Đến một lúc nào đó, bạn sẽ muốn lưu trữ chỉ mục, dữ liệu và vectors thay vì chạy lại các mô hình embedding mỗi lần. IndexStore, DocStore, VectorStore và KVStore là các trừu tượng cho phép bạn làm điều đó. Kết hợp, chúng tạo thành StorageContext. Hiện tại, chúng tôi cho phép bạn lưu trữ embeddings của mình trong các tệp trên hệ thống tệp (hoặc hệ thống tệp ảo trong bộ nhớ), nhưng chúng tôi cũng đang tích cực thêm tích hợp vào Cơ sở dữ liệu Vector.
