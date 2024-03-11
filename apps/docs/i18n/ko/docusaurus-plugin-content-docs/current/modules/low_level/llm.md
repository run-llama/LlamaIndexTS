---
sidebar_position: 0
---

# LLM

`이 문서는 자동 번역되었으며 오류가 포함될 수 있습니다. 변경 사항을 제안하려면 Pull Request를 열어 주저하지 마십시오.`

LLM은 텍스트를 읽고 질의에 대한 자연어 응답을 생성하는 역할을 담당합니다. 기본적으로 LlamaIndex.TS는 `gpt-3.5-turbo`를 사용합니다.

LLM은 명시적으로 `ServiceContext` 객체에서 설정할 수 있습니다.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## API 참조

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
