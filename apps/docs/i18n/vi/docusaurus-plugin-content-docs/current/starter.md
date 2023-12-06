---
sidebar_position: 2
---

# Hướng dẫn bắt đầu

`Tài liệu này đã được dịch tự động và có thể chứa lỗi. Đừng ngần ngại mở một Pull Request để đề xuất thay đổi.`

Sau khi bạn đã [cài đặt LlamaIndex.TS bằng NPM](installation) và thiết lập khóa OpenAI của bạn, bạn đã sẵn sàng để bắt đầu ứng dụng đầu tiên của mình:

Trong một thư mục mới:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # nếu cần thiết
```

Tạo tệp `example.ts`. Đoạn mã này sẽ tải một số dữ liệu mẫu, tạo một tài liệu, tạo chỉ mục cho nó (tạo embeddings bằng cách sử dụng OpenAI) và sau đó tạo một công cụ truy vấn để trả lời các câu hỏi về dữ liệu.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Tải bài luận từ abramov.txt trong Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Tạo đối tượng Document với bài luận
  const document = new Document({ text: essay });

  // Chia văn bản và tạo embeddings. Lưu chúng trong VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Truy vấn chỉ mục
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query(
    "Tác giả đã làm gì trong trường đại học?",
  );

  // Xuất kết quả
  console.log(response.toString());
}

main();
```

Sau đó, bạn có thể chạy nó bằng cách sử dụng

```bash
npx ts-node example.ts
```

Sẵn sàng để tìm hiểu thêm? Hãy kiểm tra sân chơi NextJS của chúng tôi tại https://llama-playground.vercel.app/. Mã nguồn có sẵn tại https://github.com/run-llama/ts-playground

"
