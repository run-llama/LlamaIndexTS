---
sidebar_position: 0
---

# LLM

LLM 负责读取文本并生成对查询的自然语言响应。默认情况下，LlamaIndex.TS 使用 `gpt-3.5-turbo`。

可以在 `ServiceContext` 对象中明确设置 LLM。

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## API 参考

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)
