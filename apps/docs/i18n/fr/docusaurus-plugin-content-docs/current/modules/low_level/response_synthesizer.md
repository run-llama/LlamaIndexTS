---
sidebar_position: 6
---

# ResponseSynthesizer

Le ResponseSynthesizer est responsable de l'envoi de la requête, des nœuds et des modèles de prompt au LLM pour générer une réponse. Il existe quelques modes clés pour générer une réponse :

- `Refine` : "créer et affiner" une réponse en passant séquentiellement par chaque fragment de texte récupéré. Cela fait un appel LLM séparé par nœud. Bon pour des réponses plus détaillées.
- `CompactAndRefine` (par défaut) : "compacter" le prompt lors de chaque appel LLM en insérant autant de fragments de texte que possible dans la taille de prompt maximale. S'il y a trop de fragments à insérer dans un seul prompt, "créer et affiner" une réponse en passant par plusieurs prompts compacts. Identique à `refine`, mais devrait entraîner moins d'appels LLM.
- `TreeSummarize` : Étant donné un ensemble de fragments de texte et la requête, construire récursivement un arbre et renvoyer le nœud racine comme réponse. Bon à des fins de résumé.
- `SimpleResponseBuilder` : Étant donné un ensemble de fragments de texte et la requête, appliquer la requête à chaque fragment de texte tout en accumulant les réponses dans un tableau. Renvoie une chaîne concaténée de toutes les réponses. Bon lorsque vous devez exécuter la même requête séparément contre chaque fragment de texte.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "J'ai 10 ans." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "John a 20 ans." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "Quel âge ai-je ?",
  nodesWithScore,
);
console.log(response.response);
```

## Référence de l'API

- [ResponseSynthesizer](../../api/classes/ResponseSynthesizer)
- [Refine](../../api/classes/Refine)
- [CompactAndRefine](../../api/classes/CompactAndRefine)
- [TreeSummarize](../../api/classes/TreeSummarize)
- [SimpleResponseBuilder](../../api/classes/SimpleResponseBuilder)
