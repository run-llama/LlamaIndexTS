---
sidebar_position: 0
---

# LLM

`此文件已自動翻譯，可能包含錯誤。如有更改建議，請毫不猶豫地提交 Pull Request。`

LLM 負責讀取文本並生成對查詢的自然語言回應。默認情況下，LlamaIndex.TS 使用 `gpt-3.5-turbo`。

LLM 可以在 `ServiceContext` 對象中明確設置。

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## API 參考

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
