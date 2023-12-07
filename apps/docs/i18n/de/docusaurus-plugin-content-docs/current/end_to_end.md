---
sidebar_position: 4
---

# End-to-End-Beispiele

`Diese Dokumentation wurde automatisch übersetzt und kann Fehler enthalten. Zögern Sie nicht, einen Pull Request zu öffnen, um Änderungen vorzuschlagen.`

Wir haben mehrere End-to-End-Beispiele mit LlamaIndex.TS im Repository enthalten.

Schauen Sie sich die folgenden Beispiele an oder probieren Sie sie aus und vervollständigen Sie sie in wenigen Minuten mit interaktiven Github Codespace-Tutorials, die von Dev-Docs [hier](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json) bereitgestellt werden:

## [Chat Engine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Lesen Sie eine Datei und unterhalten Sie sich darüber mit dem LLM.

## [Vektor-Index](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Erstellen Sie einen Vektor-Index und fragen Sie ihn ab. Der Vektor-Index verwendet Einbettungen, um die k relevantesten Knoten abzurufen. Standardmäßig ist k gleich 2.

"

## [Zusammenfassungsindex](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Erstellen Sie einen Listenindex und fragen Sie ihn ab. Dieses Beispiel verwendet auch den `LLMRetriever`, der den LLM verwendet, um die besten Knoten auszuwählen, die beim Generieren einer Antwort verwendet werden sollen.

## [Index speichern / laden](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Erstellen und laden Sie einen Vektorindex. Die Persistenz auf der Festplatte in LlamaIndex.TS erfolgt automatisch, sobald ein Speicherkontextobjekt erstellt wird.

## [Angepasster Vektorindex](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Erstellen Sie einen Vektorindex und fragen Sie ihn ab, während Sie auch das `LLM`, den `ServiceContext` und das `similarity_top_k` konfigurieren.

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Erstellen Sie ein OpenAI LLM und verwenden Sie es direkt für den Chat.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Erstellen Sie einen Llama-2 LLM und verwenden Sie ihn direkt für den Chat.

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Verwendet den `SubQuestionQueryEngine`, der komplexe Abfragen in mehrere Fragen aufteilt und dann eine Antwort über die Antworten auf alle Teilfragen aggregiert.

"

## [Niedrigstufige Module](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Dieses Beispiel verwendet mehrere niedrigstufige Komponenten, die den Bedarf an einer tatsächlichen Abfrage-Engine beseitigen. Diese Komponenten können überall verwendet werden, in jeder Anwendung, oder angepasst und untergeordnet werden, um Ihren eigenen Bedürfnissen gerecht zu werden.
