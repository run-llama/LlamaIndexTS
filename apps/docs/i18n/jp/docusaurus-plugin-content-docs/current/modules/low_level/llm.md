---
sidebar_position: 0
---

# LLM

`このドキュメントは自動的に翻訳されており、誤りを含んでいる可能性があります。変更を提案するためにプルリクエストを開くことを躊躇しないでください。`

LLMはテキストを読み取り、クエリに対して自然言語の応答を生成する責任を持っています。デフォルトでは、LlamaIndex.TSは`gpt-3.5-turbo`を使用します。

LLMは`ServiceContext`オブジェクトで明示的に設定することができます。

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## APIリファレンス

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
