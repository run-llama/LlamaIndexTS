---
sidebar_position: 6
---

# ResponseSynthesizer (SintetizatorRaspuns)

`Această documentație a fost tradusă automat și poate conține erori. Nu ezitați să deschideți un Pull Request pentru a sugera modificări.`

Sintetizatorul de răspunsuri este responsabil pentru trimiterea interogării, nodurilor și șabloanelor de prompt către LLM pentru a genera un răspuns. Există câteva moduri cheie de generare a unui răspuns:

- `Refine` (Rafinare): "crează și rafinează" un răspuns trecând secvențial prin fiecare fragment de text recuperat.
  Acest lucru face o apelare LLM separată pentru fiecare nod. Bun pentru răspunsuri mai detaliate.
- `CompactAndRefine` (Compactare și Rafinare) (implicit): "compactează" promptul în fiecare apel LLM prin umplerea cu cât mai multe fragmente de text care pot încăpea în dimensiunea maximă a promptului. Dacă există prea multe fragmente de text pentru a le încadra într-un singur prompt, "crează și rafinează" un răspuns trecând prin mai multe prompturi compacte. La fel ca `refine`, dar ar trebui să rezulte în mai puține apeluri LLM.
- `TreeSummarize` (Rezumat în Arbore): Având un set de fragmente de text și interogarea, construiește recursiv un arbore și returnează nodul rădăcină ca răspuns. Bun pentru scopuri de rezumat.
- `SimpleResponseBuilder` (Constructor Simplu de Răspunsuri): Având un set de fragmente de text și interogarea, aplică interogarea la fiecare fragment de text în timp ce acumulează răspunsurile într-un tablou. Returnează un șir concatenat al tuturor răspunsurilor. Bun atunci când trebuie să rulați aceeași interogare separat pentru fiecare fragment de text.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "Am 10 ani." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "John are 20 de ani." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "Ce vârstă am?",
  nodesWithScore,
);
console.log(response.response);
```

## Referință API

- [ResponseSynthesizer (SintetizatorRaspuns)](../../api/classes/ResponseSynthesizer.md)
- [Refine (Rafinare)](../../api/classes/Refine.md)
- [CompactAndRefine (Compactare și Rafinare)](../../api/classes/CompactAndRefine.md)
- [TreeSummarize (Rezumat în Arbore)](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder (Constructor Simplu de Răspunsuri)](../../api/classes/SimpleResponseBuilder.md)

"
