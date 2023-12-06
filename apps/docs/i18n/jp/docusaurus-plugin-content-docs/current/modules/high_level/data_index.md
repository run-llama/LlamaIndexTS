---
sidebar_position: 2
---

# インデックス

`このドキュメントは自動的に翻訳されており、誤りを含んでいる可能性があります。変更を提案するためにプルリクエストを開くことを躊躇しないでください。`

インデックスは、データの基本的なコンテナと組織です。LlamaIndex.TSでは、2つのインデックスがサポートされています：

- `VectorStoreIndex` - 応答を生成する際に、トップkの`Node`をLLMに送信します。デフォルトのトップkは2です。
- `SummaryIndex` - 応答を生成するために、インデックス内のすべての`Node`をLLMに送信します。

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "テスト" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## APIリファレンス

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
