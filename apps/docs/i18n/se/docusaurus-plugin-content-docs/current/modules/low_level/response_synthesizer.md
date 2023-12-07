---
sidebar_position: 6
---

# ResponseSynthesizer (SintetizatorOdgovora)

`Ova dokumentacija je automatski prevedena i može sadržati greške. Ne oklevajte da otvorite Pull Request za predlaganje izmena.`

ResponseSynthesizer je odgovoran za slanje upita, čvorova i predložaka za generisanje odgovora LLM-u. Postoje nekoliko ključnih načina generisanja odgovora:

- `Refine` (Usavršavanje): "kreiranje i usavršavanje" odgovora tako što se sekvenčno prolazi kroz svaki dobijeni tekstualni fragment. Ovo pravi poseban poziv LLM-u za svaki čvor. Dobro za detaljnije odgovore.
- `CompactAndRefine` (Kompaktovanje i usavršavanje) (podrazumevano): "kompaktovanje" predloška tokom svakog poziva LLM-u tako što se ubacuje što više tekstualnih fragmenata koji mogu da stanu u maksimalnu veličinu predloška. Ako ima previše fragmenata da bi se ubacili u jedan predložak, "kreira se i usavršava" odgovor prolaskom kroz više kompaktnih predložaka. Isto kao `refine`, ali bi trebalo da rezultira manjim brojem poziva LLM-u.
- `TreeSummarize` (Sumiranje stabla): Na osnovu skupa tekstualnih fragmenata i upita, rekurzivno konstruiše stablo i vraća koren kao odgovor. Dobro za svrhe sumiranja.
- `SimpleResponseBuilder` (Jednostavno izgradnja odgovora): Na osnovu skupa tekstualnih fragmenata i upita, primenjuje upit na svaki tekstualni fragment dok akumulira odgovore u niz. Vraća konkatenirani string svih odgovora. Dobro kada je potrebno pokrenuti isti upit posebno za svaki tekstualni fragment.

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
- [CompactAndRefine (Kompaktovanje i usavršavanje)](../../api/classes/CompactAndRefine.md)
- [TreeSummarize (Sumiranje stabla)](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder (Jednostavno izgradnja odgovora)](../../api/classes/SimpleResponseBuilder.md)

"
