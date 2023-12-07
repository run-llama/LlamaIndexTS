---
sidebar_position: 4
---

# End-to-End Eksempler

`Denne dokumentation er blevet automatisk oversat og kan indeholde fejl. Tøv ikke med at åbne en Pull Request for at foreslå ændringer.`

Vi inkluderer flere end-to-end eksempler ved hjælp af LlamaIndex.TS i repository'et.

Tjek eksemplerne nedenfor eller prøv dem og fuldfør dem på få minutter med interaktive Github Codespace tutorials leveret af Dev-Docs [her](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Chat Engine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Læs en fil og chat om den med LLM.

## [Vektor Index](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Opret en vektor index og forespørg på den. Vektor indexet vil bruge embeddings til at hente de mest relevante noder. Som standard er de mest relevante noder 2.

## [Summary Index](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Opret en listeindeks og forespørg på det. Dette eksempel bruger også `LLMRetriever`, som vil bruge LLM til at vælge de bedste noder at bruge, når der genereres svar.

"

## [Gem / Indlæs en Indeks](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Opret og indlæs en vektorindeks. Persistens til disk i LlamaIndex.TS sker automatisk, når et storage context objekt er oprettet.

"

## [Tilpasset Vektor Indeks](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Opret et vektor indeks og forespørg det, samtidig med at du konfigurerer `LLM`, `ServiceContext` og `similarity_top_k`.

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Opret en OpenAI LLM og brug den direkte til chat.

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Opret en Llama-2 LLM og brug den direkte til chat.

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Bruger `SubQuestionQueryEngine`, som opdeler komplekse forespørgsler i flere spørgsmål og derefter samler et svar på tværs af svarene på alle under-spørgsmål.

## [Lavniveau Moduler](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Dette eksempel bruger flere lavniveau komponenter, som fjerner behovet for en faktisk forespørgselsmotor. Disse komponenter kan bruges hvor som helst, i enhver applikation, eller tilpasses og underklassificeres for at imødekomme dine egne behov.
