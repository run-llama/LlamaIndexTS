---
sidebar_position: 3
---

# QueryEngine (쿼리 엔진)

`이 문서는 자동 번역되었으며 오류가 포함될 수 있습니다. 변경 사항을 제안하려면 Pull Request를 열어 주저하지 마십시오.`

쿼리 엔진은 `Retriever`와 `ResponseSynthesizer`를 하나의 파이프라인으로 묶어서, 쿼리 문자열을 사용하여 노드를 가져온 다음 LLM에게 응답을 생성하도록 합니다.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("쿼리 문자열");
```

## Sub Question Query Engine (하위 질문 질의 엔진)

하위 질문 질의 엔진의 기본 개념은 하나의 질의를 여러 개의 질의로 분할하고, 각 질의에 대한 답변을 가져와서 사용자에게 하나의 일관된 응답으로 결합하는 것입니다. 데이터 소스를 반복적으로 검토하여 "이를 단계별로 생각해보는" 프롬프트 기술로 생각할 수 있습니다!

### 시작하기

하위 질문 쿼리 엔진을 시작하는 가장 쉬운 방법은 [examples](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)의 subquestion.ts 파일을 실행하는 것입니다.

```bash
npx ts-node subquestion.ts
```

"

### 도구 (Tools)

하위 질문 질의 엔진은 도구(Tools)로 구현되었습니다. 도구(Tools)의 기본 아이디어는 대형 언어 모델을 위한 실행 가능한 옵션입니다. 이 경우, 하위 질문 질의 엔진은 QueryEngineTool에 의존합니다. QueryEngineTool은 QueryEngine에서 질의를 실행하기 위한 도구입니다. 이를 통해 모델에게 예를 들어 다른 질문에 대해 다른 문서를 질의할 수 있는 옵션을 제공할 수 있습니다. 또한 하위 질문 질의 엔진은 웹에서 무언가를 검색하거나 Wolfram Alpha를 사용하여 답변을 가져오는 도구를 사용할 수도 있습니다.

도구(Tools)에 대해 더 자세히 알아보려면 LlamaIndex Python 문서를 참조하십시오. https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

"

## API 참조

- [RetrieverQueryEngine (검색 엔진 쿼리 엔진)](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine (하위 질문 쿼리 엔진)](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool (쿼리 엔진 도구)](../../api/interfaces/QueryEngineTool.md)

"
