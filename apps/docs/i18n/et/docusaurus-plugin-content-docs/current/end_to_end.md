---
sidebar_position: 4
---

# Lõpust lõppu näited

`See dokumentatsioon on tõlgitud automaatselt ja võib sisaldada vigu. Ärge kartke avada Pull Request, et pakkuda muudatusi.`

Meie repositooriumis on mitmeid lõpust lõppu näiteid, kasutades LlamaIndex.TS

Vaadake allpool olevaid näiteid või proovige neid ja lõpetage need minutitega interaktiivsete Github Codespace'i õpetuste abil, mida pakub Dev-Docs [siin](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Vestlusmootor (Chat Engine)](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Loe faili ja vestle sellest LLM-iga.

## [Vektoriindeks](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Loo vektoriindeks ja päri seda. Vektoriindeks kasutab sissevõtteid, et tuua välja kõige olulisemad sõlmed. Vaikimisi on kõige olulisemad 2.

"

## [Kokkuvõtte indeks](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Loo loendi indeks ja päri seda. See näide kasutab ka `LLMRetriever`-it, mis kasutab LLM-i parimate sõlmede valimiseks vastuse genereerimisel.

"

## [Salvesta / Laadi indeks](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Loo ja laadi vektori indeks. LlamaIndex.TS-s toimub automaatne salvestamine kettale, kui salvestuskonteksti objekt on loodud.

"

## [Kohandatud vektoriindeks](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Loo vektoriindeks ja päri seda, samal ajal konfigureerides `LLM`, `ServiceContext` ja `similarity_top_k`.

"

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Loo OpenAI LLM ja kasuta seda otse vestluseks.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Loo Llama-2 LLM ja kasuta seda otse vestluseks.

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Kasutab `SubQuestionQueryEngine`-i, mis jagab keerulised päringud mitmeks alampäringuks ja seejärel kogub vastuse kõikide alampäringute vastuste põhjal kokku.

"

## [Madalama taseme moodulid](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

See näide kasutab mitmeid madalama taseme komponente, mis eemaldavad vajaduse tegeliku päringumootori järele. Neid komponente saab kasutada kõikjal, igas rakenduses või kohandada ja alamklassideks muuta vastavalt teie enda vajadustele.

"
