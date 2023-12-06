---
sidebar_position: 3
---

# QueryEngine (クエリエンジン)

`このドキュメントは自動的に翻訳されており、誤りを含んでいる可能性があります。変更を提案するためにプルリクエストを開くことを躊躇しないでください。`

クエリエンジンは`Retriever`と`ResponseSynthesizer`をパイプラインにラップし、クエリ文字列を使用してノードを取得し、それをLLMに送信して応答を生成します。

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("クエリ文字列");
```

## サブクエリクエリエンジン

サブクエリクエリエンジンの基本的なコンセプトは、単一のクエリを複数のクエリに分割し、それぞれのクエリに対して回答を取得し、それらの異なる回答をユーザーに対して単一の一貫した応答に結合することです。これは、データソースを反復処理しながら「ステップバイステップで考える」プロンプトテクニックと考えることができます！

### はじめに

サブクエリクエリエンジンを試す最も簡単な方法は、[examples](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)のsubquestion.tsファイルを実行することです。

```bash
npx ts-node subquestion.ts
```

### ツール

サブクエリクエリエンジンはツールで実装されています。ツールの基本的なアイデアは、それらが大規模な言語モデルの実行可能なオプションであるということです。この場合、SubQuestionQueryEngineはQueryEngineToolに依存しています。QueryEngineToolは、QueryEngine上でクエリを実行するためのツールです。これにより、モデルに異なる質問に対して異なるドキュメントをクエリするオプションを与えることができます。また、SubQuestionQueryEngineは、ウェブ上で何かを検索したり、Wolfram Alphaを使用して回答を取得するツールを使用することも想像できます。

ツールについて詳しくは、LlamaIndex Pythonドキュメントを参照してください。https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## API リファレンス

- [RetrieverQueryEngine (リトリーバークエリエンジン)](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine (サブクエリエンジン)](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool (クエリエンジンツール)](../../api/interfaces/QueryEngineTool.md)

"
