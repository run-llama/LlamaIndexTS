---
sidebar_position: 3
---

# NodeParser (ノードパーサー)

`このドキュメントは自動的に翻訳されており、誤りを含んでいる可能性があります。変更を提案するためにプルリクエストを開くことを躊躇しないでください。`

`NodeParser` は LlamaIndex の中で、`Document` オブジェクトをより管理しやすい `Node` オブジェクトに分割する役割を担っています。`.fromDocuments()` を呼び出すと、`ServiceContext` の中の `NodeParser` が自動的にこれを行います。また、事前にドキュメントを分割するためにも使用することができます。

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "私は10歳です。ジョンは20歳です。" }),
]);
```

## TextSplitter (テキスト分割器)

テキスト分割器は、文によってテキストを分割します。生のテキストを分割するためのスタンドアロンモジュールとしても使用することができます。

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("こんにちは、世界");
```

## API リファレンス

- [SimpleNodeParser (シンプルノードパーサー)](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter (センテンススプリッター)](../../api/classes/SentenceSplitter.md)

"
