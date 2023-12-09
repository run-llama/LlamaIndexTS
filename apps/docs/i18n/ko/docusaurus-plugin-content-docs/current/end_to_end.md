---
sidebar_position: 4
---

# 엔드 투 엔드 예제

`이 문서는 자동 번역되었으며 오류가 포함될 수 있습니다. 변경 사항을 제안하려면 Pull Request를 열어 주저하지 마십시오.`

저희는 저장소에 LlamaIndex.TS를 사용한 여러 엔드 투 엔드 예제를 포함하고 있습니다.

아래 예제를 확인하거나 [여기](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json)에서 제공되는 Dev-Docs의 대화형 Github Codespace 튜토리얼을 사용하여 몇 분 안에 시도해보고 완료할 수 있습니다:

## [채팅 엔진](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

파일을 읽고 LLM과 관련하여 채팅하세요.

## [벡터 인덱스](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

벡터 인덱스를 생성하고 쿼리합니다. 벡터 인덱스는 임베딩을 사용하여 가장 관련성이 높은 상위 k개의 노드를 가져옵니다. 기본적으로, 상위 k는 2입니다.

## [Summary Index](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

목록 인덱스를 생성하고 쿼리합니다. 이 예제는 또한 `LLMRetriever`를 사용하며, 답변을 생성할 때 사용할 최상의 노드를 선택하는 데 LLM을 사용합니다.

"

## [인덱스 저장 / 불러오기](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

벡터 인덱스를 생성하고 불러옵니다. LlamaIndex.TS에서는 저장소 컨텍스트 객체가 생성되면 자동으로 디스크에 지속성이 유지됩니다.

## [사용자 정의 벡터 인덱스](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

벡터 인덱스를 생성하고 쿼리하면서 `LLM`, `ServiceContext`, `similarity_top_k`를 구성합니다.

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

OpenAI LLM을 생성하고 채팅에 직접 사용하세요.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Llama-2 LLM을 생성하고 채팅에 직접 사용하세요.

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

`SubQuestionQueryEngine`를 사용하여 복잡한 쿼리를 여러 개의 하위 질문으로 분할하고, 그에 따라 모든 하위 질문에 대한 응답을 집계합니다.

"

## [저수준 모듈](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

이 예제는 실제 쿼리 엔진이 필요하지 않은 여러 저수준 컴포넌트를 사용합니다. 이러한 컴포넌트는 어디에서나 어떤 애플리케이션에서든 사용할 수 있으며, 필요에 맞게 사용자 정의하거나 서브클래스화하여 사용할 수 있습니다.
