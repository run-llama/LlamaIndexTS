---
sidebar_position: 4
---

# Exemple de la cap la coadă

`Această documentație a fost tradusă automat și poate conține erori. Nu ezitați să deschideți un Pull Request pentru a sugera modificări.`

Includem mai multe exemple de la cap la coadă folosind LlamaIndex.TS în depozitul nostru.

Verificați exemplele de mai jos sau încercați-le și finalizați-le în câteva minute cu tutoriale interactive Github Codespace oferite de Dev-Docs [aici](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Motor de chat (Chat Engine)](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Citiți un fișier și discutați despre el cu LLM.

## [Index Vectorial](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Creați un index vectorial și interogați-l. Indexul vectorial va utiliza înglobări pentru a obține cele mai relevante k noduri. În mod implicit, k este 2.

## [Index de rezumat](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Creați un index de listă și interogați-l. Acest exemplu utilizează, de asemenea, `LLMRetriever`, care va utiliza LLM pentru a selecta cele mai bune noduri de utilizat la generarea răspunsului.

"

## [Salvare / Încărcare unui Index](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Creați și încărcați un index vectorial. Persistența pe disc în LlamaIndex.TS se întâmplă automat odată ce este creat un obiect de context de stocare.

## [Index personalizat de vectori](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Creați un index de vectori și interogați-l, configurând în același timp `LLM`, `ServiceContext` și `similarity_top_k`.

"

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Creați un OpenAI LLM și utilizați-l direct pentru chat.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Creați un Llama-2 LLM și utilizați-l direct pentru chat.

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Folosește `SubQuestionQueryEngine`, care descompune interogările complexe în mai multe întrebări și apoi agregă un răspuns pe baza răspunsurilor la toate sub-întrebările.

"

## [Module de nivel scăzut](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Acest exemplu utilizează mai multe componente de nivel scăzut, care elimină necesitatea unui motor de interogare real. Aceste componente pot fi utilizate oriunde, în orice aplicație, sau personalizate și subclasate pentru a satisface propriile nevoi.
