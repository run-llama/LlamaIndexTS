---
sidebar_position: 4
---

# Pavyzdžiai nuo pradžios iki pabaigos

`Ši dokumentacija buvo automatiškai išversta ir gali turėti klaidų. Nedvejodami atidarykite Pull Request, jei norite pasiūlyti pakeitimus.`

Mūsų saugykloje įtraukėme keletą pavyzdžių, naudojant LlamaIndex.TS

Peržiūrėkite žemiau esančius pavyzdžius arba išbandykite juos ir užbaikite per kelias minutes su interaktyviais Github Codespace vadovais, kurie pateikiami Dev-Docs [čia](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Pokalbių variklis (Chat Engine)](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Nuskaitykite failą ir aptarkite jį su LLM.

## [Vektorių indeksas](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Sukurkite vektorių indeksą ir užklausykite jį. Vektorių indeksas naudos įdėtis, kad gautų k-ąjį labiausiai susijusį mazgą. Pagal numatytuosius nustatymus, k yra 2.

"

## [Santraukos indeksas](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Sukurkite sąrašo indeksą ir užklausykite jį. Šis pavyzdys taip pat naudoja `LLMRetriever`, kuris naudos LLM, kad pasirinktų geriausius mazgus, kai generuojamas atsakymas.

"

## [Išsaugoti / Įkelti indeksą](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Sukurkite ir įkelkite vektorinį indeksą. LlamaIndex.TS automatiškai vykdo duomenų išsaugojimą į diską, kai sukuriamas saugojimo konteksto objektas.

"

## [Pritaikytas vektorių indeksas](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Sukurkite vektorių indeksą ir užklausykite jį, tuo pačiu konfigūruodami `LLM`, `ServiceContext` ir `similarity_top_k`.

"

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Sukurkite OpenAI LLM ir tiesiogiai naudokite jį pokalbiams.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Sukurkite Llama-2 LLM ir tiesiogiai naudokite jį pokalbiams.

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Naudoja `SubQuestionQueryEngine`, kuris sudaro sudėtingus užklausimus į kelis klausimus ir tada sujungia atsakymus į visus subklausimus.

"

## [Žemų lygių modulių](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Šis pavyzdys naudoja keletą žemų lygių komponentų, kurie pašalina poreikį turėti tikrą užklausų variklį. Šiuos komponentus galima naudoti bet kur, bet kurioje programoje arba juos galima pritaikyti ir paveldėti, kad atitiktų jūsų individualius poreikius.

"
