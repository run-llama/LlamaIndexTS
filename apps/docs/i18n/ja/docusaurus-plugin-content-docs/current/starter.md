---
sidebar_position: 2
---

# スターターチュートリアル

`このドキュメントは自動的に翻訳されており、誤りを含んでいる可能性があります。変更を提案するためにプルリクエストを開くことを躊躇しないでください。`

[LlamaIndex.TSをNPMでインストール](installation)し、OpenAIキーを設定したら、最初のアプリを開始する準備ができます。

新しいフォルダで以下のコマンドを実行してください：

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # 必要な場合
```

`example.ts`というファイルを作成します。このコードは、いくつかのサンプルデータをロードし、ドキュメントを作成し、それをインデックス化します（OpenAIを使用して埋め込みを作成します）、そしてデータに関する質問に答えるためのクエリエンジンを作成します。

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Nodeでabramov.txtからエッセイをロードする
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // エッセイを含むDocumentオブジェクトを作成する
  const document = new Document({ text: essay });

  // テキストを分割し、埋め込みを作成します。VectorStoreIndexに保存します
  const index = await VectorStoreIndex.fromDocuments([document]);

  // インデックスにクエリを実行する
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query("著者は大学で何をしましたか？");

  // レスポンスを出力する
  console.log(response.toString());
}

main();
```

次に、次のコマンドを使用して実行できます：

```bash
npx ts-node example.ts
```

もっと学びたいですか？[NextJSプレイグラウンド](https://llama-playground.vercel.app/)をチェックしてみてください。ソースコードは[こちら](https://github.com/run-llama/ts-playground)で入手できます。
