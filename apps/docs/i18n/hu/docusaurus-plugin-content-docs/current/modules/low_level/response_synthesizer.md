---
sidebar_position: 6
---

# ResponseSynthesizer (Válaszszintetizátor)

`Ezt a dokumentációt automatikusan fordították le, és tartalmazhat hibákat. Ne habozzon nyitni egy Pull Requestet a változtatások javasolására.`

A ResponseSynthesizer felelős a lekérdezés, a csomópontok és a sablonok elküldéséért az LLM-nek a válasz generálásához. Néhány kulcsfontosságú módja van a válasz generálásának:

- `Finomítás`: "létrehoz és finomít" egy választ a lekérdezésben található szövegrészletek sorrendben történő átvizsgálásával. Ez minden csomópontra külön LLM hívást tesz. Jó részletesebb válaszokhoz.
- `Kompakt és finomít` (alapértelmezett): "kompakt" a sablon minden LLM hívás során, úgy hogy minél több szövegrészletet helyez be a maximális sablonméretbe. Ha túl sok részlet van ahhoz, hogy egy sablonba beleférjen, "létrehoz és finomít" egy választ több kompakt sablon átvizsgálásával. Ugyanaz, mint a `finomítás`, de kevesebb LLM hívást eredményez.
- `Fa összefoglalás`: Adott szövegrészletek és lekérdezés esetén rekurzívan felépít egy fát és a gyökércsomópontot adja vissza válaszként. Jó összefoglalás céljából.
- `Egyszerű válaszépítő`: Adott szövegrészletek és lekérdezés esetén alkalmazza a lekérdezést minden szövegrészletre, miközben a válaszokat egy tömbbe gyűjti. Egyesíti az összes válasz sztringjét. Jó, ha külön-külön szeretnéd futtatni a lekérdezést minden szövegrészletre.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "10 éves vagyok." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "John 20 éves." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "Hány éves vagyok?",
  nodesWithScore,
);
console.log(response.response);
```

## API Referencia

- [ResponseSynthesizer (Válaszszintetizátor)](../../api/classes/ResponseSynthesizer.md)
- [Finomítás](../../api/classes/Refine.md)
- [Kompakt és finomít](../../api/classes/CompactAndRefine.md)
- [Fa összefoglalás](../../api/classes/TreeSummarize.md)
- [Egyszerű válaszépítő](../../api/classes/SimpleResponseBuilder.md)

"
