---
sidebar_position: 4
---

# Voorbeelden van begin tot eind

`Deze documentatie is automatisch vertaald en kan fouten bevatten. Aarzel niet om een Pull Request te openen om wijzigingen voor te stellen.`

We hebben verschillende voorbeelden van begin tot eind opgenomen met behulp van LlamaIndex.TS in de repository.

Bekijk hieronder de voorbeelden of probeer ze uit en voltooi ze in enkele minuten met interactieve Github Codespace-tutorials die worden aangeboden door Dev-Docs [hier](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Chat Engine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Lees een bestand en praat erover met de LLM.

## [Vector Index](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Maak een vectorindex en vraag deze op. De vectorindex zal embeddings gebruiken om de meest relevante knooppunten op te halen. Standaard is de top k 2.

## [Samenvattingsindex](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Maak een lijstindex en vraag deze op. Dit voorbeeld maakt ook gebruik van de `LLMRetriever`, die de LLM zal gebruiken om de beste knooppunten te selecteren bij het genereren van een antwoord.

## [Een index opslaan / laden](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Maak een vectorindex aan en laad deze. Het opslaan op schijf in LlamaIndex.TS gebeurt automatisch zodra er een opslagcontextobject is gemaakt.

## [Aangepaste Vector Index](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Maak een vectorindex en doorzoek deze, terwijl je ook de `LLM`, de `ServiceContext` en de `similarity_top_k` configureert.

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Maak een OpenAI LLM en gebruik deze direct voor chat.

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Maak een Llama-2 LLM aan en gebruik deze direct voor chat.

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Maakt gebruik van de `SubQuestionQueryEngine`, die complexe queries opsplitst in meerdere vragen en vervolgens een antwoord verzamelt op basis van de antwoorden op alle subvragen.

"

## [Modules op laag niveau](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Dit voorbeeld maakt gebruik van verschillende modules op laag niveau, waardoor de noodzaak voor een daadwerkelijke query-engine wordt verwijderd. Deze modules kunnen overal worden gebruikt, in elke toepassing, of aangepast en afgeleid om aan uw eigen behoeften te voldoen.
