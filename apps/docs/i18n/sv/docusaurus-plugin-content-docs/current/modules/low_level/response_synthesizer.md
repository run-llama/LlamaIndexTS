---
sidebar_position: 6
---

# ResponseSynthesizer

`Denna dokumentation har översatts automatiskt och kan innehålla fel. Tveka inte att öppna en Pull Request för att föreslå ändringar.`

ResponseSynthesizer är ansvarig för att skicka frågan, noderna och promptmallarna till LLM för att generera ett svar. Det finns några nyckellägen för att generera ett svar:

- `Refine`: "skapa och förbättra" ett svar genom att sekventiellt gå igenom varje hämtad textbit.
  Detta gör ett separat LLM-anrop per nod. Bra för mer detaljerade svar.
- `CompactAndRefine` (standard): "kompakta" prompten under varje LLM-anrop genom att fylla på med så
  många textbitar som får plats inom den maximala promptstorleken. Om det finns
  för många bitar för att få plats i en prompt, "skapa och förbättra" ett svar genom att gå igenom
  flera kompakta promptar. Samma som `refine`, men bör resultera i färre LLM-anrop.
- `TreeSummarize`: Givet en uppsättning textbitar och frågan, konstruera rekursivt ett träd
  och returnera rotnoden som svar. Bra för sammanfattningssyften.
- `SimpleResponseBuilder`: Givet en uppsättning textbitar och frågan, tillämpa frågan på varje textbit
  samtidigt som svaren ackumuleras i en array. Returnerar en sammanslagen sträng av alla
  svar. Bra när du behöver köra samma fråga separat mot varje textbit.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "Jag är 10 år gammal." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "John är 20 år gammal." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "Hur gammal är jag?",
  nodesWithScore,
);
console.log(response.response);
```

## API-referens

- [ResponseSynthesizer](../../api/classes/ResponseSynthesizer.md)
- [Refine](../../api/classes/Refine.md)
- [CompactAndRefine](../../api/classes/CompactAndRefine.md)
- [TreeSummarize](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder](../../api/classes/SimpleResponseBuilder.md)
