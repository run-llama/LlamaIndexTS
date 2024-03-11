---
sidebar_position: 6
---

# ResponseSynthesizer

`Deze documentatie is automatisch vertaald en kan fouten bevatten. Aarzel niet om een Pull Request te openen om wijzigingen voor te stellen.`

De ResponseSynthesizer is verantwoordelijk voor het verzenden van de query, nodes en prompt templates naar de LLM om een ​​reactie te genereren. Er zijn een paar belangrijke modi voor het genereren van een reactie:

- `Refine`: "creëer en verfijn" een antwoord door sequentieel door elke opgehaalde tekstfragment te gaan.
  Dit maakt een aparte LLM-oproep per Node. Goed voor gedetailleerdere antwoorden.
- `CompactAndRefine` (standaard): "compact" de prompt tijdens elke LLM-oproep door zoveel mogelijk tekstfragmenten in te voegen die passen binnen de maximale promptgrootte. Als er te veel fragmenten zijn om in één prompt in te voegen, "creëer en verfijn" een antwoord door meerdere compacte prompts te doorlopen. Hetzelfde als `refine`, maar zou resulteren in minder LLM-oproepen.
- `TreeSummarize`: Gegeven een set tekstfragmenten en de query, recursief een boom construeren
  en de root-node retourneren als reactie. Goed voor samenvattingsdoeleinden.
- `SimpleResponseBuilder`: Gegeven een set tekstfragmenten en de query, de query toepassen op elk tekstfragment
  terwijl de reacties worden opgebouwd in een array. Retourneert een geconcateneerde string van alle
  reacties. Goed wanneer u dezelfde query apart moet uitvoeren tegen elk tekstfragment.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "Ik ben 10 jaar oud." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "John is 20 jaar oud." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "Hoe oud ben ik?",
  nodesWithScore,
);
console.log(response.response);
```

## API Referentie

- [ResponseSynthesizer](../../api/classes/ResponseSynthesizer.md)
- [Refine](../../api/classes/Refine.md)
- [CompactAndRefine](../../api/classes/CompactAndRefine.md)
- [TreeSummarize](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder](../../api/classes/SimpleResponseBuilder.md)

"
