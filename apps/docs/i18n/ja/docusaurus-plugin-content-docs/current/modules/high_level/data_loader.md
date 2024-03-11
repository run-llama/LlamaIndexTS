---
sidebar_position: 1
---

# リーダー / ローダー

`このドキュメントは自動的に翻訳されており、誤りを含んでいる可能性があります。変更を提案するためにプルリクエストを開くことを躊躇しないでください。`

LlamaIndex.TSは、`SimpleDirectoryReader`クラスを使用してフォルダから簡単にファイルを読み込むことができます。現在、`.txt`、`.pdf`、`.csv`、`.md`、`.docx`ファイルがサポートされており、将来的にはさらに多くのファイル形式がサポートされる予定です！

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## API リファレンス

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)
