---
sidebar_position: 6
---

# ResponseSynthesizer

`Denne dokumentation er blevet automatisk oversat og kan indeholde fejl. Tøv ikke med at åbne en Pull Request for at foreslå ændringer.`

ResponseSynthesizer er ansvarlig for at sende forespørgslen, noderne og promptskabelonerne til LLM for at generere et svar. Der er nogle få nøgletilstande til generering af et svar:

- `Refine`: "opret og forbedre" et svar ved at gå sekventielt gennem hver hentet tekstblok.
  Dette foretager et separat LLM-opkald pr. node. Godt til mere detaljerede svar.
- `CompactAndRefine` (standard): "kompakt" prompten under hvert LLM-opkald ved at fylde så mange tekstblokke som muligt inden for den maksimale promptstørrelse. Hvis der er for mange blokke til at fylde i én prompt, "opret og forbedre" et svar ved at gå gennem flere kompakte prompts. Det samme som `refine`, men bør resultere i færre LLM-opkald.
- `TreeSummarize`: Givet en række tekstblokke og forespørgslen, konstruer rekursivt et træ og returner rodnoden som svaret. Godt til opsummeringsformål.
- `SimpleResponseBuilder`: Givet en række tekstblokke og forespørgslen, anvend forespørgslen på hver tekstblok, mens svarene akkumuleres i en matrix. Returnerer en sammensat streng af alle svar. Godt, når du har brug for at køre den samme forespørgsel separat mod hver tekstblok.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "Jeg er 10 år gammel." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "John er 20 år gammel." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "Hvor gammel er jeg?",
  nodesWithScore,
);
console.log(response.response);
```

## API Reference

- [ResponseSynthesizer](../../api/classes/ResponseSynthesizer.md)
- [Refine](../../api/classes/Refine.md)
- [CompactAndRefine](../../api/classes/CompactAndRefine.md)
- [TreeSummarize](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder](../../api/classes/SimpleResponseBuilder.md)

"
