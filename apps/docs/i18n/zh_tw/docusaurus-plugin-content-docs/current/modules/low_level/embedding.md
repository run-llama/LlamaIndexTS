---
sidebar_position: 1
---

# 嵌入 (Embedding)

`此文件已自動翻譯，可能包含錯誤。如有更改建議，請毫不猶豫地提交 Pull Request。`

LlamaIndex中的嵌入模型负责创建文本的数值表示。默认情况下，LlamaIndex将使用OpenAI的`text-embedding-ada-002`模型。

可以在`ServiceContext`对象中明确设置。

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## API 参考 (API Reference)

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
