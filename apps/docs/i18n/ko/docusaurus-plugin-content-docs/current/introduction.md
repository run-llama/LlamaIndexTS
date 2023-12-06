---
sidebar_position: 0
slug: /
---

# LlamaIndex.TS란 무엇인가요?

`이 문서는 자동 번역되었으며 오류가 포함될 수 있습니다. 변경 사항을 제안하려면 Pull Request를 열어 주저하지 마십시오.`

LlamaIndex.TS는 LLM 애플리케이션에서 개인 또는 도메인별 데이터를 수집, 구조화 및 액세스하기 위한 데이터 프레임워크입니다. 파이썬 패키지도 사용할 수 있지만 (여기를 참조하세요: [링크](https://docs.llamaindex.ai/en/stable/)), LlamaIndex.TS는 TypeScript와 함께 사용하기 위해 최적화된 간단한 패키지로 핵심 기능을 제공합니다.

## 🚀 LlamaIndex.TS를 사용하는 이유는 무엇인가요?

LLM은 인간과 추론된 데이터 간의 자연어 인터페이스를 제공합니다. 널리 사용되는 모델은 Wikipedia, 메일링 리스트, 교과서 및 소스 코드와 같은 대중적으로 사용 가능한 데이터에 대해 사전 훈련되어 있습니다.

LLM을 기반으로 한 애플리케이션은 종종 이러한 모델을 개인 또는 도메인별 데이터로 보강해야 합니다. 그러나 이러한 데이터는 종종 애플리케이션 및 데이터 저장소 간에 분산되어 있습니다. API 뒤에 있거나 SQL 데이터베이스에 저장되어 있거나 PDF 및 슬라이드 덱에 갇혀 있을 수 있습니다.

이럴 때 **LlamaIndex.TS**가 필요합니다.

## 🦙 LlamaIndex.TS는 어떻게 도움이 될까요?

LlamaIndex.TS는 다음과 같은 도구를 제공합니다:

- **데이터 로딩** 기존의 `.txt`, `.pdf`, `.csv`, `.md` 및 `.docx` 데이터를 직접 수집합니다.
- **데이터 인덱스** 중간 표현으로 데이터를 구조화하여 LLM이 소비하기 쉽고 성능이 우수합니다.
- **엔진**은 데이터에 대한 자연어 액세스를 제공합니다. 예를 들어:
  - 쿼리 엔진은 지식 증강 출력을 위한 강력한 검색 인터페이스입니다.
  - 채팅 엔진은 데이터와의 다중 메시지 "왕복" 상호작용을 위한 대화형 인터페이스입니다.

## 👨‍👩‍👧‍👦 LlamaIndex는 누구를 위한 것인가요?

LlamaIndex.TS는 JavaScript와 TypeScript로 LLM 앱을 개발하는 모든 사람들을 위한 필수 도구 세트를 제공합니다.

우리의 고수준 API를 사용하면 초보 사용자도 LlamaIndex.TS를 사용하여 데이터를 수집하고 쿼리할 수 있습니다.

더 복잡한 애플리케이션의 경우, 저희의 저수준 API를 사용하여 고급 사용자가 모듈 (데이터 커넥터, 인덱스, 리트리버 및 쿼리 엔진)를 사용자의 요구에 맞게 사용자 정의하고 확장할 수 있습니다.

## 시작하기

`npm install llamaindex`

저희 문서에는 [설치 지침](./installation.md)과 [스타터 튜토리얼](./starter.md)이 포함되어 있어 첫 번째 애플리케이션을 빌드할 수 있습니다.

한 번 시작하면, [고수준 개념](./concepts.md)에서 LlamaIndex의 모듈식 아키텍처에 대한 개요를 확인할 수 있습니다. 더 많은 실전 예제를 원하신다면, [End-to-End 튜토리얼](./end_to_end.md)을 참조해주세요.

"

## 🗺️ 생태계

LlamaIndex를 다운로드하거나 기여하려면 다음을 참조하세요:

- Github: https://github.com/run-llama/LlamaIndexTS
- NPM: https://www.npmjs.com/package/llamaindex

"

## 커뮤니티

도움이 필요하신가요? 기능 제안이 있으신가요? LlamaIndex 커뮤니티에 참여해보세요:

- Twitter: https://twitter.com/llama_index
- Discord: https://discord.gg/dGcwcsnxhU
