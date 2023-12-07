# 핵심 모듈

`이 문서는 자동 번역되었으며 오류가 포함될 수 있습니다. 변경 사항을 제안하려면 Pull Request를 열어 주저하지 마십시오.`

LlamaIndex.TS는 빠르게 시작할 수 있는 고수준 모듈과 필요에 따라 핵심 구성 요소를 사용자 정의할 수 있는 저수준 모듈로 구성되어 있습니다.

## 고수준 모듈

- [**문서 (Document)**](./high_level/documents_and_nodes.md): 문서는 텍스트 파일, PDF 파일 또는 기타 연속적인 데이터를 나타냅니다.

- [**노드 (Node)**](./high_level/documents_and_nodes.md): 기본 데이터 구성 요소입니다. 일반적으로 문서를 관리 가능한 작은 조각으로 분할한 것으로, 임베딩 모델과 LLM에 공급할 수 있는 크기입니다.

- [**리더/로더 (Reader/Loader)**](./high_level/data_loader.md): 리더 또는 로더는 실제 세계에서 문서를 입력으로 받아 Document 클래스로 변환하여 인덱스와 쿼리에서 사용할 수 있도록 합니다. 현재 일반 텍스트 파일과 PDF를 지원하며, 더 많은 형식을 지원할 예정입니다.

- [**인덱스 (Indexes)**](./high_level/data_index.md): 인덱스는 노드와 해당 노드의 임베딩을 저장합니다.

- [**쿼리 엔진 (QueryEngine)**](./high_level/query_engine.md): 쿼리 엔진은 입력한 쿼리를 생성하고 결과를 반환합니다. 쿼리 엔진은 일반적으로 미리 작성된 프롬프트와 인덱스에서 선택한 노드를 결합하여 LLM이 쿼리에 대답하기 위해 필요한 컨텍스트를 제공합니다.

- [**챗 엔진 (ChatEngine)**](./high_level/chat_engine.md): 챗 엔진은 인덱스와 상호 작용하는 챗봇을 구축하는 데 도움을 줍니다.

## 저수준 모듈

- [**LLM**](./low_level/llm.md): LLM 클래스는 OpenAI GPT-4, Anthropic Claude 또는 Meta LLaMA와 같은 대형 언어 모델 제공자를 통합 인터페이스로 제공합니다. 이 클래스를 서브클래스화하여 사용자 고유의 대형 언어 모델에 대한 커넥터를 작성할 수 있습니다.

- [**Embedding**](./low_level/embedding.md): 임베딩은 부동 소수점 숫자의 벡터로 표현됩니다. OpenAI의 text-embedding-ada-002는 기본 임베딩 모델이며, 생성되는 각 임베딩은 1,536개의 부동 소수점 숫자로 구성됩니다. 다른 인기있는 임베딩 모델로는 BERT가 있으며, 각 노드를 표현하기 위해 768개의 부동 소수점 숫자를 사용합니다. 최대 마진 관련성을 포함한 3가지 유사도 계산 옵션과 임베딩 작업에 사용할 수 있는 여러 유틸리티를 제공합니다.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): 텍스트 분할 전략은 임베딩 검색의 전반적인 효과에 매우 중요합니다. 현재는 기본값이 있지만 일반적인 해결책은 없습니다. 소스 문서에 따라 다른 분할 크기와 전략을 사용하고 싶을 수 있습니다. 현재는 고정 크기로 분할, 겹치는 섹션을 포함한 고정 크기로 분할, 문장으로 분할 및 단락으로 분할하는 것을 지원합니다. 텍스트 분할기는 `Document`를 `Node`로 분할할 때 NodeParser에서 사용됩니다.

- [**Retriever**](./low_level/retriever.md): Retriever는 실제로 인덱스에서 검색할 Node를 선택하는 역할을 합니다. 여기에서는 쿼리당 더 많거나 적은 Node를 검색하거나 유사도 함수를 변경하거나 응용 프로그램의 각 개별 사용 사례에 대해 별도의 검색기를 만들고 싶을 수 있습니다. 예를 들어, 코드 콘텐츠와 텍스트 콘텐츠에 대해 별도의 검색기를 사용하고 싶을 수 있습니다.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): ResponseSynthesizer는 쿼리 문자열을 가져와 `Node` 목록을 사용하여 응답을 생성하는 역할을 담당합니다. 이는 모든 컨텍스트를 반복하고 답변을 정제하거나 요약의 트리를 구축하고 루트 요약을 반환하는 등 다양한 형태로 이루어질 수 있습니다.

- [**Storage**](./low_level/storage.md): 언젠가는 임베딩 모델을 매번 다시 실행하는 대신 인덱스, 데이터 및 벡터를 저장하고 싶을 것입니다. IndexStore, DocStore, VectorStore 및 KVStore는 이를 가능하게 하는 추상화입니다. 이들은 StorageContext를 형성합니다. 현재는 파일 시스템(또는 가상 인메모리 파일 시스템)에 임베딩을 지속적으로 저장할 수 있도록 허용하지만, Vector Database와의 통합도 활발히 추가하고 있습니다.

"
