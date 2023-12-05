---
sidebar_position: 3
---

# Moteur de requête

Un moteur de requête enveloppe un `Retriever` et un `ResponseSynthesizer` dans un pipeline, qui utilisera la chaîne de requête pour récupérer des nœuds, puis les enverra au LLM pour générer une réponse.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("chaîne de requête");
```

## Moteur de requête de sous-question

Le concept de base du moteur de requête de sous-question est de diviser une seule requête en plusieurs requêtes, d'obtenir une réponse pour chacune de ces requêtes, puis de combiner ces différentes réponses en une seule réponse cohérente pour l'utilisateur. Vous pouvez le considérer comme la technique de "réfléchir étape par étape" mais en itérant sur vos sources de données!

### Pour commencer

La manière la plus simple de commencer à essayer le Moteur de requête de sous-question est d'exécuter le fichier subquestion.ts dans [examples](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

### Outils

Le moteur de requête de sous-question est implémenté avec des Outils. L'idée de base des Outils est qu'ils sont des options exécutables pour le grand modèle de langage. Dans ce cas, notre moteur de requête de sous-question repose sur QueryEngineTool, qui, comme vous l'avez deviné, est un outil pour exécuter des requêtes sur un QueryEngine. Cela nous permet de donner au modèle une option pour interroger différents documents pour différentes questions, par exemple. Vous pourriez également imaginer que le moteur de requête de sous-question pourrait utiliser un Outil qui recherche quelque chose sur le web ou obtient une réponse en utilisant Wolfram Alpha.

Vous pouvez en apprendre davantage sur les Outils en consultant la documentation Python de LlamaIndex https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## Référence de l'API

- [RetrieverQueryEngine](../../api/classes/RetrieverQueryEngine)
- [SubQuestionQueryEngine](../../api/classes/SubQuestionQueryEngine)
- [QueryEngineTool](../../api/interfaces/QueryEngineTool)
