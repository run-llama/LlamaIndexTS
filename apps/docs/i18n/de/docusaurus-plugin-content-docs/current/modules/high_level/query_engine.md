---
sidebar_position: 3
---

# QueryEngine (Abfrage-Engine)

`Diese Dokumentation wurde automatisch übersetzt und kann Fehler enthalten. Zögern Sie nicht, einen Pull Request zu öffnen, um Änderungen vorzuschlagen.`

Eine Abfrage-Engine umschließt einen `Retriever` und einen `ResponseSynthesizer` in einer Pipeline, die den Abfrage-String verwendet, um Knoten abzurufen und sie dann an den LLM zu senden, um eine Antwort zu generieren.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("Abfrage-String");
```

## Sub Question Query Engine (Unterfrage-Abfrage-Engine)

Das grundlegende Konzept der Unterfrage-Abfrage-Engine besteht darin, eine einzelne Abfrage in mehrere Abfragen aufzuteilen, für jede dieser Abfragen eine Antwort zu erhalten und dann diese verschiedenen Antworten zu einer einzigen kohärenten Antwort für den Benutzer zu kombinieren. Sie können es sich als die Technik des "Schritt für Schritt durchdenkens" vorstellen, indem Sie Ihre Datenquellen durchlaufen!

### Erste Schritte

Der einfachste Weg, um die Unterfrage-Abfrage-Engine auszuprobieren, besteht darin, die Datei subquestion.ts in [Beispielen](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts) auszuführen.

```bash
npx ts-node subquestion.ts
```

### Tools

Die SubQuestionQueryEngine wird mit Tools implementiert. Die grundlegende Idee von Tools besteht darin, dass sie ausführbare Optionen für das große Sprachmodell sind. In diesem Fall stützt sich unsere SubQuestionQueryEngine auf QueryEngineTool, das, wie Sie vermutet haben, ein Tool zum Ausführen von Abfragen auf einer QueryEngine ist. Dadurch können wir dem Modell die Möglichkeit geben, verschiedene Dokumente für verschiedene Fragen abzufragen. Sie könnten sich auch vorstellen, dass die SubQuestionQueryEngine ein Tool verwenden könnte, das im Web nach etwas sucht oder eine Antwort mit Wolfram Alpha erhält.

Weitere Informationen zu Tools finden Sie in der Python-Dokumentation von LlamaIndex unter https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## API-Referenz

- [RetrieverQueryEngine (Retriever-Abfrage-Engine)](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine (Unterfrage-Abfrage-Engine)](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool (Abfrage-Engine-Tool)](../../api/interfaces/QueryEngineTool.md)
