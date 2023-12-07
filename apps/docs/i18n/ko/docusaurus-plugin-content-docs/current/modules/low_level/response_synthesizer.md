---
sidebar_position: 6
---

# ResponseSynthesizer (응답 합성기)

`이 문서는 자동 번역되었으며 오류가 포함될 수 있습니다. 변경 사항을 제안하려면 Pull Request를 열어 주저하지 마십시오.`

ResponseSynthesizer는 쿼리, 노드 및 프롬프트 템플릿을 LLM에 보내 응답을 생성하는 역할을 담당합니다. 응답을 생성하는 몇 가지 주요 모드가 있습니다:

- `Refine` (정제): 각 검색된 텍스트 청크를 순차적으로 통과하여 답변을 "생성 및 정제"합니다. 각 노드에 대해 별도의 LLM 호출을 수행합니다. 자세한 답변에 적합합니다.
- `CompactAndRefine` (기본값): 각 LLM 호출 중 프롬프트를 "압축"하여 최대 프롬프트 크기 내에 맞을 수 있는 텍스트 청크를 가능한 많이 채웁니다. 하나의 프롬프트에 채울 수 있는 청크가 너무 많은 경우, 여러 개의 압축 프롬프트를 통해 답변을 "생성 및 정제"합니다. `refine`와 동일하지만 LLM 호출 횟수가 적어집니다.
- `TreeSummarize` (트리 요약): 주어진 텍스트 청크 세트와 쿼리를 사용하여 재귀적으로 트리를 구성하고 루트 노드를 응답으로 반환합니다. 요약 목적에 적합합니다.
- `SimpleResponseBuilder` (간단한 응답 빌더): 주어진 텍스트 청크 세트와 쿼리를 사용하여 각 텍스트 청크에 쿼리를 적용하면서 응답을 배열에 누적합니다. 모든 응답의 연결된 문자열을 반환합니다. 각 텍스트 청크에 대해 별도로 동일한 쿼리를 실행해야 할 때 유용합니다.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "I am 10 years old." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "John is 20 years old." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "What age am I?",
  nodesWithScore,
);
console.log(response.response);
```

## API 참조

- [ResponseSynthesizer (응답 합성기)](../../api/classes/ResponseSynthesizer.md)
- [Refine (정제)](../../api/classes/Refine.md)
- [CompactAndRefine (압축 및 정제)](../../api/classes/CompactAndRefine.md)
- [TreeSummarize (트리 요약)](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder (간단한 응답 빌더)](../../api/classes/SimpleResponseBuilder.md)
