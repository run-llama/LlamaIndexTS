---
sidebar_position: 4
---

# Exempel från början till slut

`Denna dokumentation har översatts automatiskt och kan innehålla fel. Tveka inte att öppna en Pull Request för att föreslå ändringar.`

Vi inkluderar flera exempel från början till slut med användning av LlamaIndex.TS i repositoryn.

Kolla in exemplen nedan eller prova dem och slutför dem på några minuter med interaktiva Github Codespace-tutorials som tillhandahålls av Dev-Docs [här](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Chattmotor](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Läs en fil och chatta om den med LLM.

## [Vektorindex](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Skapa ett vektorindex och fråga det. Vektorindexet kommer att använda inbäddningar för att hämta de k mest relevanta noderna. Som standard är k-värdet 2.

"

## [Sammanfattningsindex](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Skapa en listindex och fråga den. Detta exempel använder också `LLMRetriever`, som kommer att använda LLM för att välja de bästa noderna att använda vid generering av svar.

## [Spara / Ladda en Index](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Skapa och ladda en vektorindex. Persistens till disk i LlamaIndex.TS sker automatiskt när en lagringskontextobjekt skapas.

"

## [Anpassad Vektorindex](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Skapa en vektorindex och fråga det, samtidigt som du konfigurerar `LLM`, `ServiceContext` och `similarity_top_k`.

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Skapa en OpenAI LLM och använd den direkt för chatt.

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Skapa en Llama-2 LLM och använd den direkt för chatt.

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Använder `SubQuestionQueryEngine`, som bryter ner komplexa frågor i flera delfrågor och sedan sammanställer ett svar över svaren på alla delfrågor.

"

## [Moduler på låg nivå](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Detta exempel använder flera komponenter på låg nivå, vilket eliminerar behovet av en faktisk frågemotor. Dessa komponenter kan användas var som helst, i vilken applikation som helst, eller anpassas och underklassas för att möta dina egna behov.

"
