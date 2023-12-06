---
sidebar_position: 6
---

# ResponseSynthesizer (レスポンス合成器)

`このドキュメントは自動的に翻訳されており、誤りを含んでいる可能性があります。変更を提案するためにプルリクエストを開くことを躊躇しないでください。`

ResponseSynthesizerは、クエリ、ノード、およびプロンプトテンプレートをLLMに送信して応答を生成する責任を持ちます。応答を生成するためのいくつかの主要なモードがあります：

- `Refine`（洗練）：各取得したテキストチャンクを順番に処理して回答を「作成および洗練」します。これにより、各ノードごとに別々のLLM呼び出しが行われます。詳細な回答に適しています。
- `CompactAndRefine`（コンパクトおよび洗練）（デフォルト）：各LLM呼び出し中にプロンプトを「コンパクト化」し、最大プロンプトサイズ内に収まるだけのテキストチャンクを詰め込みます。1つのプロンプトに詰め込むチャンクが多すぎる場合は、「作成および洗練」を行い、複数のコンパクトプロンプトを通じて回答を生成します。`refine`と同じですが、LLM呼び出し回数が少なくなるはずです。
- `TreeSummarize`（ツリー要約）：テキストチャンクのセットとクエリが与えられた場合、再帰的にツリーを構築し、ルートノードを応答として返します。要約の目的に適しています。
- `SimpleResponseBuilder`（シンプルな応答ビルダー）：テキストチャンクのセットとクエリが与えられた場合、クエリを各テキストチャンクに適用し、応答を配列に蓄積します。すべての応答の連結された文字列を返します。各テキストチャンクに対して個別に同じクエリを実行する必要がある場合に適しています。

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "私は10歳です。" }),
    score: 1,
  },
  {
    node: new TextNode({ text: "ジョンは20歳です。" }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "私は何歳ですか？",
  nodesWithScore,
);
console.log(response.response);
```

## APIリファレンス

- [ResponseSynthesizer (レスポンス合成器)](../../api/classes/ResponseSynthesizer.md)
- [Refine (洗練)](../../api/classes/Refine.md)
- [CompactAndRefine (コンパクトおよび洗練)](../../api/classes/CompactAndRefine.md)
- [TreeSummarize (ツリー要約)](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder (シンプルな応答ビルダー)](../../api/classes/SimpleResponseBuilder.md)
