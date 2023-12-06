---
sidebar_position: 6
---

# ResponseSynthesizer (Atbildes sintezators)

`Šis dokuments ir automātiski tulkots un var saturēt kļūdas. Nevilciniet atvērt Pull Request, lai ierosinātu izmaiņas.`

ResponseSynthesizer ir atbildīgs par vaicājuma, mezglu un iedvesmas veidņu nosūtīšanu LLM, lai ģenerētu atbildi. Ir daži galvenie režīmi atbildes ģenerēšanai:

- `Refine` (Precizēt): "izveidot un precizēt" atbildi, secīgi pārskatot katru iegūto teksta gabalu. Tas veic atsevišķu LLM pieprasījumu katram mezglam. Labi piemērots detalizētām atbildēm.
- `CompactAndRefine` (Kompakti un precizēt) (noklusējums): "kompakti" veidņu laikā katrā LLM pieprasījumā, ievietojot pēc iespējas vairāk teksta gabalu, kas ietilpst maksimālajā veidņu izmērā. Ja ir pārāk daudz gabalu, lai ievietotu vienā veidnē, "izveidot un precizēt" atbildi, pārejot cauri vairākiem kompaktiem veidņiem. Tas ir tas pats kā `refine`, bet vajadzētu rezultēt mazāk LLM pieprasījumos.
- `TreeSummarize` (Koka kopsavilkums): Izmantojot teksta gabalu kopu un vaicājumu, rekursīvi veido koku un atgriež saknes mezglu kā atbildi. Labi piemērots kopsavilkuma nolūkiem.
- `SimpleResponseBuilder` (Vienkāršs atbilžu veidotājs): Izmantojot teksta gabalu kopu un vaicājumu, piemēro vaicājumu katram teksta gabalam, vienlaikus apkopojot atbildes masīvā. Atgriež visu atbilžu apvienoto virkni. Labi piemērots, ja jums ir nepieciešams atsevišķi izpildīt vienādu vaicājumu pret katru teksta gabalu.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "Man ir 10 gadu." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "Džons ir 20 gadu." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "Cik vecs esmu?",
  nodesWithScore,
);
console.log(response.response);
```

## API atsauce

- [ResponseSynthesizer (Atbildes sintezators)](../../api/classes/ResponseSynthesizer.md)
- [Refine (Precizēt)](../../api/classes/Refine.md)
- [CompactAndRefine (Kompakti un precizēt)](../../api/classes/CompactAndRefine.md)
- [TreeSummarize (Koka kopsavilkums)](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder (Vienkāršs atbilžu veidotājs)](../../api/classes/SimpleResponseBuilder.md)
