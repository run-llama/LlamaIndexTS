---
sidebar_position: 5
---

# レトリーバー (Retriever)

`このドキュメントは自動的に翻訳されており、誤りを含んでいる可能性があります。変更を提案するためにプルリクエストを開くことを躊躇しないでください。`

LlamaIndexにおけるレトリーバーは、クエリ文字列を使用してインデックスから`Node`を取得するために使用されます。`VectorIndexRetriever`は、トップ-kの最も類似したノードを取得します。一方、`SummaryIndexRetriever`は、クエリに関係なくすべてのノードを取得します。

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// ノードを取得します！
const nodesWithScore = await retriever.retrieve("クエリ文字列");
```

## API リファレンス

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)
