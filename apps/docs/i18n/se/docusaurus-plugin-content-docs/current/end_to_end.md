---
sidebar_position: 4
---

# Примери од почетка до краja

`Ova dokumentacija je automatski prevedena i može sadržati greške. Ne oklevajte da otvorite Pull Request za predlaganje izmena.`

У репозиторијуму укључујемо неколико примера од почетка до краја користећи LlamaIndex.TS

Погледајте примере испод или их испробајте и завршите за неколико минута са интерактивним упутствима за Github Codespace које нуди Dev-Docs [овде](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Chat Engine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Pročitajte datoteku i razgovarajte o njoj sa LLM.

## [Векторски Индекс](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Креирајте векторски индекс и претражите га. Векторски индекс ће користити уграђивања да би добио најрелевантније врхове k. Подразумевано, k је 2.

"

## [Индекс сажетка](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Креирајте листу индекса и претражите је. Овај пример такође користи `LLMRetriever`, који ће користити LLM за избор најбољих чворова за коришћење при генерисању одговора.

"

## [Сачувајте / Учитајте индекс](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Креирајте и учитајте векторски индекс. Постојаност на диску у LlamaIndex.TS се дешава аутоматски једном када се креира објекат контекста складишта.

"

## [Прилагођени векторски индекс](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Креирајте векторски индекс и претражите га, истовремено конфигуришући `LLM`, `ServiceContext` и `similarity_top_k`.

"

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Креирајте OpenAI LLM и директно га користите за четовање.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Креирајте Llama-2 LLM и директно га користите за четовање.

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Користи `SubQuestionQueryEngine`, који разбија комплексне упите на више питања, а затим агрегира одговоре на сва подпитања.

"

## [Модули ниског нивоа](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Овај пример користи неколико компоненти ниског нивоа, што уклања потребу за стварним мотором за упите. Ове компоненте могу се користити било где, у било којој апликацији, или прилагођавати и подкласирати да задовоље ваше потребе.

"
