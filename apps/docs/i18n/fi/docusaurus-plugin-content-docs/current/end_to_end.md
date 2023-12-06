---
sidebar_position: 4
---

# Esimerkkejä päästä päähän

`Tämä dokumentaatio on käännetty automaattisesti ja se saattaa sisältää virheitä. Älä epäröi avata Pull Requestia ehdottaaksesi muutoksia.`

Sisällytämme useita esimerkkejä, jotka käyttävät LlamaIndex.TS:ää repositoryssa.

Tutustu alla oleviin esimerkkeihin tai kokeile niitä ja suorita ne minuuteissa interaktiivisten Github Codespace -opetusohjelmien avulla, jotka tarjoaa Dev-Docs [täältä](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Chat Engine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Lue tiedosto ja keskustele siitä LLM:n kanssa.

## [Vektori-indeksi](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Luo vektori-indeksi ja kysely se. Vektori-indeksi käyttää upotuksia hakeakseen k k relevanttia solmua. Oletuksena k on 2.

"

## [Yhteenvetoindeksi](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Luo luetteloindeksi ja kysy sitä. Tässä esimerkissä käytetään myös `LLMRetriever`ia, joka käyttää LLM:ää valitessaan parhaita solmuja käytettäväksi vastausta generoidessa.

"

## [Tallenna / Lataa indeksi](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Luo ja lataa vektori-indeksi. Tallennus levylle LlamaIndex.TS:ssä tapahtuu automaattisesti, kun tallennuskontekstiobjekti luodaan.

"

## [Mukautettu vektori-indeksi](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Luo vektori-indeksi ja kysely sitä samalla määrittäen `LLM`, `ServiceContext` ja `similarity_top_k`.

"

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Luo OpenAI LLM ja käytä sitä suoraan keskusteluun.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Luo Llama-2 LLM ja käytä sitä suoraan keskusteluun.

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Käyttää `SubQuestionQueryEngine` -moduulia, joka jakaa monimutkaiset kyselyt useisiin alikysymyksiin ja sitten kokoaa vastauksen kaikkien alikysymysten vastauksiin.

"

## [Matalan tason moduulit](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Tämä esimerkki käyttää useita matalan tason komponentteja, jotka poistavat tarpeen todelliselle kyselymoottorille. Näitä komponentteja voidaan käyttää missä tahansa sovelluksessa tai mukauttaa ja aliluokittaa vastaamaan omia tarpeitasi.
