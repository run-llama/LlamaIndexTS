---
sidebar_position: 6
---

# ResponseSynthesizer

`Diese Dokumentation wurde automatisch übersetzt und kann Fehler enthalten. Zögern Sie nicht, einen Pull Request zu öffnen, um Änderungen vorzuschlagen.`

Der ResponseSynthesizer ist dafür verantwortlich, die Abfrage, Knoten und Vorlagen für die Antwort an den LLM zu senden, um eine Antwort zu generieren. Es gibt einige wichtige Modi zur Generierung einer Antwort:

- `Refine`: "Erstellen und Verfeinern" einer Antwort, indem jeder abgerufene Textabschnitt sequenziell durchlaufen wird.
  Dies führt zu einem separaten LLM-Aufruf pro Knoten. Gut für detailliertere Antworten.
- `CompactAndRefine` (Standard): "Kompaktieren" der Eingabeaufforderung während jedes LLM-Aufrufs, indem so viele Textabschnitte wie möglich in die maximale Größe der Eingabeaufforderung gepackt werden. Wenn es zu viele Abschnitte gibt, um in eine Eingabeaufforderung zu passen, wird eine Antwort durch "Erstellen und Verfeinern" durch mehrere kompakte Eingabeaufforderungen erzeugt. Das Gleiche wie `refine`, sollte jedoch zu weniger LLM-Aufrufen führen.
- `TreeSummarize`: Basierend auf einer Reihe von Textabschnitten und der Abfrage wird rekursiv ein Baum erstellt und der Wurzelknoten als Antwort zurückgegeben. Gut für Zusammenfassungszwecke.
- `SimpleResponseBuilder`: Basierend auf einer Reihe von Textabschnitten und der Abfrage wird die Abfrage auf jeden Textabschnitt angewendet und die Antworten in einem Array akkumuliert. Gibt eine verkettete Zeichenkette aller Antworten zurück. Gut, wenn Sie dieselbe Abfrage separat gegen jeden Textabschnitt ausführen müssen.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "Ich bin 10 Jahre alt." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "John ist 20 Jahre alt." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "Wie alt bin ich?",
  nodesWithScore,
);
console.log(response.response);
```

## API-Referenz

- [ResponseSynthesizer](../../api/classes/ResponseSynthesizer.md)
- [Refine](../../api/classes/Refine.md)
- [CompactAndRefine](../../api/classes/CompactAndRefine.md)
- [TreeSummarize](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder](../../api/classes/SimpleResponseBuilder.md)

"
