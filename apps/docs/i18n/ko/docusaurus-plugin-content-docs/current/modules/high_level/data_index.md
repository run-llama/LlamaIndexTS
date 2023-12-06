---
sidebar_position: 2
---

# 색인

`이 문서는 자동 번역되었으며 오류가 포함될 수 있습니다. 변경 사항을 제안하려면 Pull Request를 열어 주저하지 마십시오.`

색인은 데이터의 기본 컨테이너이자 조직 방법입니다. LlamaIndex.TS는 두 가지 색인을 지원합니다:

- `VectorStoreIndex` - 응답을 생성할 때 상위 k개의 `Node`를 LLM에 전송합니다. 기본적으로 상위 2개를 전송합니다.
- `SummaryIndex` - 응답을 생성하기 위해 색인의 모든 `Node`를 LLM에 전송합니다.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## API 참조

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
