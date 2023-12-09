---
sidebar_position: 6
---

# ResponseSynthesizer (SintetizatorOdgovora)

`Ova dokumentacija je automatski prevedena i može sadržavati greške. Ne ustručavajte se otvoriti Pull Request za predlaganje promjena.`

ResponseSynthesizer je odgovoran za slanje upita, čvorova i predložaka poruka LLM-u radi generiranja odgovora. Postoje nekoliko ključnih načina generiranja odgovora:

- `Refine` (Usavršavanje): "stvaranje i usavršavanje" odgovora tako da se sekvenčno prolazi kroz svaki dobiveni tekstualni fragment. Ovo izvršava zaseban poziv LLM-u po čvoru. Dobro za detaljnije odgovore.
- `CompactAndRefine` (Kompaktiranje i usavršavanje) (zadano): "kompaktiranje" predloška tijekom svakog poziva LLM-u tako da se stavi što više tekstualnih fragmenata koji mogu stati unutar maksimalne veličine predloška. Ako ima previše fragmenata za stavljanje u jedan predložak, "stvaranje i usavršavanje" odgovora prolaskom kroz više kompaktnih predložaka. Isto kao `Refine`, ali bi trebalo rezultirati manjim brojem poziva LLM-u.
- `TreeSummarize` (Sažimanje stabla): Na temelju skupa tekstualnih fragmenata i upita, rekurzivno konstruiraj stablo i vrati korijenski čvor kao odgovor. Dobro za svrhe sažimanja.
- `SimpleResponseBuilder` (Jednostavno izgraditelj odgovora): Na temelju skupa tekstualnih fragmenata i upita, primijeni upit na svaki tekstualni fragment dok se odgovori akumuliraju u niz. Vraća spojeni niz svih odgovora. Dobro kada trebate pokrenuti isti upit zasebno za svaki tekstualni fragment.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "Imam 10 godina." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "John ima 20 godina." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "Koliko godina imam?",
  nodesWithScore,
);
console.log(response.response);
```

## API Reference (API referenca)

- [ResponseSynthesizer (SintetizatorOdgovora)](../../api/classes/ResponseSynthesizer.md)
- [Refine (Usavršavanje)](../../api/classes/Refine.md)
- [CompactAndRefine (Kompaktiranje i usavršavanje)](../../api/classes/CompactAndRefine.md)
- [TreeSummarize (Sažimanje stabla)](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder (Jednostavno izgraditelj odgovora)](../../api/classes/SimpleResponseBuilder.md)

"
