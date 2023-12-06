---
sidebar_position: 1
---

# 埋め込み

`このドキュメントは自動的に翻訳されており、誤りを含んでいる可能性があります。変更を提案するためにプルリクエストを開くことを躊躇しないでください。`

LlamaIndexの埋め込みモデルは、テキストの数値表現を作成する責任を持ちます。デフォルトでは、LlamaIndexはOpenAIの`text-embedding-ada-002`モデルを使用します。

これは、`ServiceContext`オブジェクトで明示的に設定することができます。

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## APIリファレンス

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
