---
sidebar_position: 1
---

# 임베딩 (Embedding)

`이 문서는 자동 번역되었으며 오류가 포함될 수 있습니다. 변경 사항을 제안하려면 Pull Request를 열어 주저하지 마십시오.`

LlamaIndex의 임베딩 모델은 텍스트의 수치적 표현을 생성하는 역할을 담당합니다. 기본적으로 LlamaIndex는 OpenAI의 `text-embedding-ada-002` 모델을 사용합니다.

이는 명시적으로 `ServiceContext` 객체에서 설정할 수 있습니다.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## API 참조

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
