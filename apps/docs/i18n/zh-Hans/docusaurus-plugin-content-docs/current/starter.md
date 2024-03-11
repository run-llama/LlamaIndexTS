---
sidebar_position: 2
---

# 入门教程

一旦你已经[使用NPM安装了LlamaIndex.TS](installation)并设置了你的OpenAI密钥，你就可以开始你的第一个应用了：

在一个新文件夹中：

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # 如有必要
```

创建文件 `example.ts`。这段代码将加载一些示例数据，创建一个文档，对其进行索引（这将使用OpenAI创建嵌入），然后创建查询引擎以回答有关数据的问题。

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // 在Node中从abramov.txt加载文章
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // 使用文章创建Document对象
  const document = new Document({ text: essay });

  // 分割文本并创建嵌入。将它们存储在VectorStoreIndex中
  const index = await VectorStoreIndex.fromDocuments([document]);

  // 查询索引
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query("作者在大学中做了什么？");

  // 输出响应
  console.log(response.toString());
}

main();
```

然后你可以使用以下命令运行它

```bash
npx ts-node example.ts
```

准备好了解更多吗？请查看我们的NextJS游乐场 https://llama-playground.vercel.app/ 。源代码可在 https://github.com/run-llama/ts-playground 获取。
