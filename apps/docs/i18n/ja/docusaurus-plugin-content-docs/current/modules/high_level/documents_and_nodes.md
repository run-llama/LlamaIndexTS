---
sidebar_position: 0
---

# ドキュメントとノード

`このドキュメントは自動的に翻訳されており、誤りを含んでいる可能性があります。変更を提案するためにプルリクエストを開くことを躊躇しないでください。`

`Document`と`Node`は、どんなインデックスの基本的な構成要素です。これらのオブジェクトのAPIは似ていますが、`Document`オブジェクトはファイル全体を表し、`Node`は元のドキュメントの小さな部分で、LLMとQ&Aに適しています。

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "テキスト", metadata: { key: "val" } });
```

## APIリファレンス

- [Document](../../api/classes/Document.md)
- [TextNode](../../api/classes/TextNode.md)

"
