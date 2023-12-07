---
sidebar_position: 6
---

# ResponseSynthesizer (SintetizatorOdgovora)

`Ta dokumentacija je bila samodejno prevedena in lahko vsebuje napake. Ne oklevajte odpreti Pull Request za predlaganje sprememb.`

SintetizatorOdgovora je odgovoren za pošiljanje poizvedbe, vozlišč in predlogov predlogov LLM za generiranje odgovora. Obstaja nekaj ključnih načinov za generiranje odgovora:

- `Refine` (Izboljšaj): "ustvari in izboljšaj" odgovor z zaporednim pregledovanjem vsakega pridobljenega koščka besedila.
  To naredi ločen klic LLM na vozlišče. Dobro za podrobnejše odgovore.
- `CompactAndRefine` (KompaktnoInIzboljšaj) (privzeto): "kompaktno" predlogo med vsakim klicem LLM z vstavljanjem
  čim več koščkov besedila, ki se prilegajo največji velikosti predloge. Če je
  preveč koščkov za vstavljanje v eno predlogo, "ustvari in izboljšaj" odgovor z večkratnim pregledovanjem
  kompaktnih predlogov. Enako kot `refine`, vendar bi moralo rezultirati v manj klicih LLM.
- `TreeSummarize` (PovzemiDrevo): Glede na nabor koščkov besedila in poizvedbo rekurzivno sestavi drevo
  in vrne koren vozlišča kot odgovor. Dobro za namene povzemanja.
- `SimpleResponseBuilder` (PreprostGraditeljOdgovora): Glede na nabor koščkov besedila in poizvedbo uporabi poizvedbo na vsakem besedilnem
  koščku med kopičenjem odgovorov v matriko. Vrne združen niz vseh
  odgovorov. Dobro, ko morate poizvedbo posebej zagnati proti vsakemu besedilnemu
  koščku.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "Star sem 10 let." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "John je star 20 let." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "Koliko let imam?",
  nodesWithScore,
);
console.log(response.response);
```

## API Reference (ReferencaAPI)

- [ResponseSynthesizer (SintetizatorOdgovora)](../../api/classes/ResponseSynthesizer.md)
- [Refine (Izboljšaj)](../../api/classes/Refine.md)
- [CompactAndRefine (KompaktnoInIzboljšaj)](../../api/classes/CompactAndRefine.md)
- [TreeSummarize (PovzemiDrevo)](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder (PreprostGraditeljOdgovora)](../../api/classes/SimpleResponseBuilder.md)

"
