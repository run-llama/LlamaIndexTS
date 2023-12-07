---
sidebar_position: 4
---

# Eksempler fra start til slutt

`Denne dokumentasjonen har blitt automatisk oversatt og kan inneholde feil. Ikke nøl med å åpne en Pull Request for å foreslå endringer.`

Vi inkluderer flere eksempler fra start til slutt ved bruk av LlamaIndex.TS i repositoryen.

Sjekk ut eksemplene nedenfor eller prøv dem ut og fullfør dem på få minutter med interaktive Github Codespace-tutorials levert av Dev-Docs [her](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Chat Engine (ChatEngine)](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Les en fil og diskuter den med LLM.

## [Vektorindeks](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Opprett en vektorindeks og spør den. Vektorindeksen vil bruke innebygde representasjoner for å hente de k mest relevante nodene. Som standard er k lik 2.

"

## [Sammendragsindeks](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Opprett en listeindeks og spør den. Dette eksempelet bruker også `LLMRetriever`, som vil bruke LLM til å velge de beste nodene å bruke når du genererer svar.

## [Lagre / Last inn en indeks](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Opprett og last inn en vektorindeks. Lagring til disk i LlamaIndex.TS skjer automatisk når et lagringskontekstobjekt er opprettet.

"

## [Tilpasset Vektorindeks](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Opprett en vektorindeks og spør den, samtidig som du konfigurerer `LLM`, `ServiceContext` og `similarity_top_k`.

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Opprett en OpenAI LLM og bruk den direkte til chat.

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Opprett en Llama-2 LLM og bruk den direkte til chat.

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Bruker `SubQuestionQueryEngine`, som bryter komplekse spørringer ned i flere spørsmål, og deretter samler et svar på tvers av svarene på alle delspørsmål.

"

## [Lavnivåmoduler](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Dette eksempelet bruker flere lavnivåkomponenter, som fjerner behovet for en faktisk spørringsmotor. Disse komponentene kan brukes hvor som helst, i hvilken som helst applikasjon, eller tilpasses og underklasse for å møte dine egne behov.
