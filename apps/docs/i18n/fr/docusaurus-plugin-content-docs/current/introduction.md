---
sidebar_position: 0
slug: /
---

# Qu'est-ce que LlamaIndex.TS?

LlamaIndex.TS est un framework de données pour les applications LLM permettant d'ingérer, de structurer et d'accéder à des données privées ou spécifiques à un domaine. Alors qu'un package python est également disponible (voir [ici](https://docs.llamaindex.ai/en/stable/)), LlamaIndex.TS offre des fonctionnalités de base dans un package simple, optimisé pour une utilisation avec TypeScript.

## 🚀 Pourquoi LlamaIndex.TS?

Fondamentalement, les LLM offrent une interface de langage naturel entre les humains et les données inférées. Les modèles largement disponibles sont pré-entraînés sur d'énormes quantités de données disponibles publiquement, de Wikipedia et des listes de diffusion à des manuels et du code source.

Les applications construites sur les LLM nécessitent souvent d'augmenter ces modèles avec des données privées ou spécifiques à un domaine. Malheureusement, ces données peuvent être réparties dans des applications et des magasins de données cloisonnés. Elles se trouvent derrière des API, dans des bases de données SQL, ou piégées dans des PDF et des présentations.

C'est là que **LlamaIndex.TS** intervient.

## 🦙 Comment LlamaIndex.TS peut-il aider?

LlamaIndex.TS fournit les outils suivants :

- **Chargement de données** : ingérez directement vos données existantes en format `.txt`, `.pdf`, `.csv`, `.md` et `.docx`
- **Indexation des données** : structurez vos données dans des représentations intermédiaires faciles et performantes à consommer pour les LLM.
- **Moteurs** : fournissent un accès en langage naturel à vos données. Par exemple :
  - Les moteurs de requête sont des interfaces de récupération puissantes pour une sortie augmentée par la connaissance.
  - Les moteurs de chat sont des interfaces conversationnelles pour des interactions multi-messages, des échanges "aller-retour" avec vos données.

## 👨‍👩‍👧‍👦 Pour qui est LlamaIndex?

LlamaIndex.TS fournit un ensemble d'outils essentiels pour toute personne développant des applications LLM avec JavaScript et TypeScript.

Notre API de haut niveau permet aux utilisateurs débutants d'utiliser LlamaIndex.TS pour ingérer et interroger leurs données.

Pour des applications plus complexes, nos API de bas niveau permettent aux utilisateurs avancés de personnaliser et d'étendre n'importe quel module - connecteurs de données, index, récupérateurs et moteurs de requêtes - pour répondre à leurs besoins.

## Pour commencer

`npm install llamaindex`

Notre documentation comprend des [Instructions d'installation](./installation) et un [Tutoriel de démarrage](./starter) pour construire votre première application.

Une fois que vous êtes opérationnel, les [Concepts de haut niveau](./concepts) donnent un aperçu de l'architecture modulaire de LlamaIndex. Pour plus d'exemples pratiques, consultez nos [Tutoriels de bout en bout](./end_to_end).

## 🗺️ Écosystème

Pour télécharger ou contribuer, trouvez LlamaIndex sur :

- Github : https://github.com/run-llama/LlamaIndexTS
- NPM : https://www.npmjs.com/package/llamaindex

## Communauté

Besoin d'aide ? Vous avez une suggestion de fonctionnalité ? Rejoignez la communauté LlamaIndex :

- Twitter : https://twitter.com/llama_index
- Discord : https://discord.gg/dGcwcsnxhU
