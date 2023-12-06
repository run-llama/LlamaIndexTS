---
sidebar_position: 6
---

# ResponseSynthesizer (SvarSyntetisator)

`Denne dokumentasjonen har blitt automatisk oversatt og kan inneholde feil. Ikke nøl med å åpne en Pull Request for å foreslå endringer.`

SvarSyntetisatoren er ansvarlig for å sende spørringen, nodene og malene for prompten til LLM for å generere et svar. Det er noen få nøkkelmoduser for å generere et svar:

- `Forbedre`: "opprett og forbedre" et svar ved å gå sekvensielt gjennom hver hentet tekstbit.
  Dette gjør en separat LLM-kall per Node. Bra for mer detaljerte svar.
- `KompaktOgForbedre` (standard): "kompakt" prompten under hvert LLM-kall ved å fylle så mange tekstbiter som kan passe innenfor maksimal promptstørrelse. Hvis det er for mange biter til å fylle i én prompt, "opprett og forbedre" et svar ved å gå gjennom flere kompakte prompter. Det samme som `forbedre`, men bør resultere i færre LLM-kall.
- `TreOppsummering`: Gitt en mengde tekstbiter og spørringen, konstruer en trestruktur rekursivt
  og returner rotnoden som svaret. Bra for oppsummeringsformål.
- `EnkelSvarBygger`: Gitt en mengde tekstbiter og spørringen, bruk spørringen på hver tekstbit
  mens du akkumulerer svarene i en matrise. Returnerer en sammenslått streng av alle
  svarene. Bra når du trenger å kjøre samme spørring separat mot hver tekstbit.

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

## API-referanse

- [ResponseSynthesizer (SvarSyntetisator)](../../api/classes/ResponseSynthesizer.md)
- [Forbedre (Refine)](../../api/classes/Refine.md)
- [KompaktOgForbedre (CompactAndRefine)](../../api/classes/CompactAndRefine.md)
- [TreOppsummering (TreeSummarize)](../../api/classes/TreeSummarize.md)
- [EnkelSvarBygger (SimpleResponseBuilder)](../../api/classes/SimpleResponseBuilder.md)

"
