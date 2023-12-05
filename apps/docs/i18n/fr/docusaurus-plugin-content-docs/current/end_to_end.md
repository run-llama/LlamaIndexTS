---
sidebar_position: 4
---

# Exemples de bout en bout

Nous incluons plusieurs exemples de bout en bout en utilisant LlamaIndex.TS dans le référentiel.

Consultez les exemples ci-dessous ou essayez-les et complétez-les en quelques minutes avec les tutoriels interactifs de Github Codespace fournis par Dev-Docs [ici](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Chat Engine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Lisez un fichier et discutez à ce sujet avec le LLM.

## [Index de vecteurs](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Créez un index de vecteurs et interrogez-le. L'index de vecteurs utilisera des plongements pour récupérer les nœuds les plus pertinents les plus proches. Par défaut, le top k est 2.

## [Index de résumé](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Créez un index de liste et interrogez-le. Cet exemple utilise également le `LLMRetriever`, qui utilisera le LLM pour sélectionner les meilleurs nœuds à utiliser lors de la génération de la réponse.

## [Enregistrer / Charger un index](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Créez et chargez un index de vecteurs. La persistance sur le disque dans LlamaIndex.TS se fait automatiquement une fois qu'un objet de contexte de stockage est créé.

## [Index de vecteur personnalisé](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Créez un index de vecteur et interrogez-le, tout en configurant le `LLM`, le `ServiceContext` et le `similarity_top_k`.

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Créez un OpenAI LLM et utilisez-le directement pour discuter.

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Créez un Llama-2 LLM et utilisez-le directement pour discuter.

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Utilise le `SubQuestionQueryEngine`, qui divise les requêtes complexes en plusieurs questions, puis agrège une réponse à travers les réponses à toutes les sous-questions.

## [Modules de bas niveau](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Cet exemple utilise plusieurs composants de bas niveau, ce qui élimine le besoin d'un moteur de requête réel. Ces composants peuvent être utilisés n'importe où, dans n'importe quelle application, ou personnalisés et sous-classés pour répondre à vos propres besoins.
