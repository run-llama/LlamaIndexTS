# Modules de base

LlamaIndex.TS propose plusieurs modules de base, séparés en modules de haut niveau pour démarrer rapidement et en modules de bas niveau pour personnaliser les composants clés selon vos besoins.

## Modules de haut niveau

- [**Document**](./high_level/documents_and_nodes): Un document représente un fichier texte, un fichier PDF ou toute autre donnée contiguë.

- [**Node**](./high_level/documents_and_nodes): La brique de construction de données de base. Le plus souvent, il s'agit de parties du document divisées en morceaux gérables assez petits pour être intégrées dans un modèle d'incorporation et LLM.

- [**Reader/Loader**](./high_level/data_loader): Un lecteur ou un chargeur est quelque chose qui prend un document dans le monde réel et le transforme en une classe Document qui peut ensuite être utilisée dans votre Index et vos requêtes. Nous prenons actuellement en charge les fichiers texte brut et les PDF, avec de nombreux autres à venir.

- [**Indexes**](./high_level/data_index): les index stockent les nœuds et les incorporations de ces nœuds.

- [**QueryEngine**](./high_level/query_engine): Les moteurs de requête génèrent la requête que vous saisissez et vous renvoient le résultat. Les moteurs de requête combinent généralement une invite pré-construite avec des nœuds sélectionnés dans votre Index pour donner au LLM le contexte dont il a besoin pour répondre à votre requête.

- [**ChatEngine**](./high_level/chat_engine): Un ChatEngine vous aide à construire un chatbot qui interagira avec vos Index.

## Module de bas niveau

- [**LLM**](./low_level/llm): La classe LLM est une interface unifiée sur un grand fournisseur de modèle de langage tel que OpenAI GPT-4, Anthropic Claude, ou Meta LLaMA. Vous pouvez la sous-classer pour écrire un connecteur vers votre propre grand modèle de langage.

- [**Embedding**](./low_level/embedding): Un embedding est représenté par un vecteur de nombres flottants. Le modèle d'embedding par défaut d'OpenAI est text-embedding-ada-002 et chaque embedding qu'il génère est composé de 1 536 nombres flottants. Un autre modèle d'embedding populaire est BERT qui utilise 768 nombres flottants pour représenter chaque nœud. Nous fournissons un certain nombre d'utilitaires pour travailler avec les embeddings, y compris 3 options de calcul de similarité et une pertinence marginale maximale.

- [**TextSplitter/NodeParser**](./low_level/node_parser): Les stratégies de découpe de texte sont incroyablement importantes pour l'efficacité globale de la recherche d'embedding. Actuellement, bien que nous ayons une valeur par défaut, il n'y a pas de solution universelle. Selon les documents sources, vous voudrez peut-être utiliser différentes tailles et stratégies de découpe. Actuellement, nous prenons en charge la découpe par taille fixe, la découpe par taille fixe avec des sections chevauchantes, la découpe par phrase et la découpe par paragraphe. Le découpeur de texte est utilisé par le NodeParser lors de la découpe des `Document`s en `Node`s.

- [**Retriever**](./low_level/retriever): Le Retriever est ce qui choisit effectivement les Nodes à récupérer dans l'index. Ici, vous pouvez essayer de récupérer plus ou moins de Nodes par requête, changer votre fonction de similarité, ou créer votre propre retriever pour chaque cas d'utilisation individuel dans votre application. Par exemple, vous pouvez souhaiter avoir un retriever séparé pour le contenu de code par rapport au contenu textuel.

- [**ResponseSynthesizer**](./low_level/response_synthesizer): Le ResponseSynthesizer est responsable de prendre une chaîne de requête et d'utiliser une liste de `Node`s pour générer une réponse. Cela peut prendre de nombreuses formes, comme itérer sur tout le contexte et affiner une réponse, ou construire un arbre de résumés et renvoyer le résumé principal.

- [**Storage**](./low_level/storage): À un moment donné, vous voudrez stocker vos index, données et vecteurs au lieu de relancer les modèles d'embedding à chaque fois. IndexStore, DocStore, VectorStore et KVStore sont des abstractions qui vous permettent de le faire. Ensemble, ils forment le StorageContext. Actuellement, nous vous permettons de persister vos embeddings dans des fichiers sur le système de fichiers (ou un système de fichiers virtuel en mémoire), mais nous ajoutons également activement des intégrations aux bases de données de vecteurs.
