---
sidebar_position: 2
---

# 入門教程

`此文件已自動翻譯，可能包含錯誤。如有更改建議，請毫不猶豫地提交 Pull Request。`

一旦您[使用NPM安裝了LlamaIndex.TS](installation)並設置了您的OpenAI密鑰，您就可以開始您的第一個應用程序了：

在一個新的文件夾中：

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # 如果需要的話
```

創建文件 `example.ts`。這段代碼將加載一些示例數據，創建一個文檔，對其進行索引（使用OpenAI創建嵌入），然後創建一個查詢引擎來回答有關數據的問題。

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // 從Node中的abramov.txt文件加載文章
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // 使用文章創建Document對象
  const document = new Document({ text: essay });

  // 分割文本並創建嵌入。將它們存儲在VectorStoreIndex中
  const index = await VectorStoreIndex.fromDocuments([document]);

  // 查詢索引
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query("作者在大學裡做了什麼？");

  // 輸出回答
  console.log(response.toString());
}

main();
```

然後您可以使用以下命令運行它

```bash
npx ts-node example.ts
```

準備好學習更多了嗎？請查看我們的NextJS遊樂場，網址為https://llama-playground.vercel.app/。源代碼可在https://github.com/run-llama/ts-playground找到。
