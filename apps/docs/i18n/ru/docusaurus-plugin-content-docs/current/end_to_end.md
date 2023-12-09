---
sidebar_position: 4
---

# Примеры от начала до конца

`Эта документация была автоматически переведена и может содержать ошибки. Не стесняйтесь открывать Pull Request для предложения изменений.`

Мы включили несколько примеров от начала до конца, используя LlamaIndex.TS в репозитории.

Ознакомьтесь с примерами ниже или попробуйте их и завершите их за несколько минут с помощью интерактивных учебников Github Codespace, предоставленных Dev-Docs [здесь](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Чатовый движок (Chat Engine)](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Прочитайте файл и обсудите его с LLM.

## [Векторный индекс](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Создайте векторный индекс и выполните запрос к нему. Векторный индекс будет использовать вложения для получения двух наиболее релевантных узлов по умолчанию.

"

## [Индекс сводной информации](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Создайте список индексов и выполните запрос к нему. В этом примере также используется `LLMRetriever`, который будет использовать LLM для выбора лучших узлов для использования при генерации ответа.

"

## [Сохранение / Загрузка индекса](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Создайте и загрузите векторный индекс. Сохранение на диск в LlamaIndex.TS происходит автоматически после создания объекта контекста хранения.

"

## [Настроенный векторный индекс](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Создайте векторный индекс и выполните запрос к нему, настроив `LLM`, `ServiceContext` и `similarity_top_k`.

"

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Создайте OpenAI LLM и непосредственно используйте его для чата.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Создайте Llama-2 LLM и непосредственно используйте его для чата.

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Использует `SubQuestionQueryEngine`, который разбивает сложные запросы на несколько вопросов, а затем агрегирует ответы на все подвопросы.

"

## [Модули низкого уровня](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Этот пример использует несколько компонентов низкого уровня, что устраняет необходимость в фактическом движке запросов. Эти компоненты могут быть использованы в любом месте, в любом приложении или настроены и унаследованы для удовлетворения ваших собственных потребностей.

"
