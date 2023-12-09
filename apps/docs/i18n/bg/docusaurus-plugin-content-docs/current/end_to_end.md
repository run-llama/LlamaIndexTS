---
sidebar_position: 4
---

# Примери от начало до край

`Тази документация е преведена автоматично и може да съдържа грешки. Не се колебайте да отворите Pull Request, за да предложите промени.`

Включени са няколко примера от начало до край, използвайки LlamaIndex.TS в хранилището

Разгледайте примерите по-долу или ги опитайте и завършете за минути с интерактивни уроци на Github Codespace, предоставени от Dev-Docs [тук](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Чат двигател (Chat Engine)](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Прочетете файл и обсъждайте го с LLM.

## [Векторен индекс](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Създайте векторен индекс и го запитайте. Векторният индекс ще използва вграждания, за да извлече най-релевантните k върха. По подразбиране, k е 2.

"

## [Summary Index](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Създайте списъчен индекс и го заявете. Този пример също използва `LLMRetriever`, който използва LLM, за да избере най-добрите възли за използване при генериране на отговор.

"

## [Запазване / Зареждане на индекс](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Създайте и заредете векторен индекс. Запазването на диска в LlamaIndex.TS става автоматично, веднага след като е създаден обект за контекст на съхранение.

## [Персонализиран векторен индекс](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Създайте векторен индекс и го заявете, като конфигурирате `LLM`, `ServiceContext` и `similarity_top_k`.

"

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Създайте OpenAI LLM и го използвайте директно за чат.

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Създайте Llama-2 LLM и го използвайте директно за чат.

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Използва `SubQuestionQueryEngine`, който разбива сложни заявки на множество въпроси и след това агрегира отговорите на всички под-въпроси.

"

## [Модули с ниско ниво](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Този пример използва няколко компонента с ниско ниво, които премахват нуждата от реален двигател за заявки. Тези компоненти могат да се използват навсякъде, във всяко приложение или да бъдат персонализирани и подкласирани, за да отговарят на вашите нужди.

"
