---
sidebar_position: 7
---

# ストレージ

`このドキュメントは自動的に翻訳されており、誤りを含んでいる可能性があります。変更を提案するためにプルリクエストを開くことを躊躇しないでください。`

LlamaIndex.TSのストレージは、`StorageContext`オブジェクトを設定した後に自動的に機能します。単に`persistDir`を設定し、インデックスにアタッチするだけです。

現時点では、ディスクからの保存と読み込みのみがサポートされており、将来的には他の統合も計画されています！

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "テストテキスト" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## APIリファレンス

- [StorageContext](../../api/interfaces/StorageContext.md)

"
