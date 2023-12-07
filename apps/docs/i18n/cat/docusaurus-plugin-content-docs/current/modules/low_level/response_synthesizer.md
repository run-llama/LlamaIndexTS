---
sidebar_position: 6
---

# ResponseSynthesizer (Sintetitzador de Resposta)

`Aquesta documentació s'ha traduït automàticament i pot contenir errors. No dubteu a obrir una Pull Request per suggerir canvis.`

El ResponseSynthesizer és responsable d'enviar la consulta, els nodes i les plantilles de prompt al LLM per generar una resposta. Hi ha alguns modes clau per generar una resposta:

- `Refine` (Refinar): "crear i refinar" una resposta passant seqüencialment per cada fragment de text recuperat. Això fa una crida separada al LLM per a cada Node. És bo per a respostes més detallades.
- `CompactAndRefine` (Compactar i Refinar) (per defecte): "compactar" el prompt durant cada crida al LLM, omplint tants fragments de text com puguin cabre dins de la mida màxima del prompt. Si hi ha massa fragments per a omplir en un sol prompt, "crear i refinar" una resposta passant per diversos prompts compactes. És el mateix que `refine`, però hauria de resultar en menys crides al LLM.
- `TreeSummarize` (Resumir en forma d'arbre): Donat un conjunt de fragments de text i la consulta, construeix recursivament un arbre i retorna el node arrel com a resposta. És bo per a fins de resum.
- `SimpleResponseBuilder` (Constructor de Resposta Simple): Donat un conjunt de fragments de text i la consulta, aplica la consulta a cada fragment de text mentre acumula les respostes en un array. Retorna una cadena concatenada de totes les respostes. És bo quan necessites executar la mateixa consulta per separat en cada fragment de text.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "Tinc 10 anys." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "John té 20 anys." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "Quina edat tinc?",
  nodesWithScore,
);
console.log(response.response);
```

## Referència de l'API

- [ResponseSynthesizer (Sintetitzador de Resposta)](../../api/classes/ResponseSynthesizer.md)
- [Refine (Refinar)](../../api/classes/Refine.md)
- [CompactAndRefine (Compactar i Refinar)](../../api/classes/CompactAndRefine.md)
- [TreeSummarize (Resumir en forma d'arbre)](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder (Constructor de Resposta Simple)](../../api/classes/SimpleResponseBuilder.md)

"
