---
sidebar_position: 0
---

# 문서와 노드

`이 문서는 자동 번역되었으며 오류가 포함될 수 있습니다. 변경 사항을 제안하려면 Pull Request를 열어 주저하지 마십시오.`

`문서(Document)`와 `노드(Node)`는 모든 인덱스의 기본 구성 요소입니다. 이 객체들의 API는 유사하지만, `문서(Document)` 객체는 전체 파일을 나타내는 반면, `노드(Node)`는 해당 원본 문서의 작은 조각으로, LLM과 Q&A에 적합합니다.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "텍스트", metadata: { key: "val" } });
```

## API 참조

- [문서(Document)](../../api/classes/Document.md)
- [텍스트노드(TextNode)](../../api/classes/TextNode.md)

"
