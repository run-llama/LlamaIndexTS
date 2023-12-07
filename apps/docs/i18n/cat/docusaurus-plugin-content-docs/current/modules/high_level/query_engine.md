---
sidebar_position: 3
---

# Motor de Consulta (QueryEngine)

`Aquesta documentació s'ha traduït automàticament i pot contenir errors. No dubteu a obrir una Pull Request per suggerir canvis.`

Un motor de consulta envolta un `Retriever` i un `ResponseSynthesizer` en un pipeline, que utilitzarà la cadena de consulta per obtenir nodes i després enviar-los a LLM per generar una resposta.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("cadena de consulta");
```

## Motor de Consulta de Subpreguntes

El concepte bàsic del Motor de Consulta de Subpreguntes és que divideix una única consulta en múltiples consultes, obté una resposta per a cada una d'aquestes consultes i després combina aquestes respostes diferents en una única resposta coherent per a l'usuari. Podeu pensar-hi com a tècnica de "pensa-ho pas a pas" però iterant sobre les fonts de dades!

### Començar

La manera més senzilla de començar a provar el Motor de Consulta de Subpreguntes és executar el fitxer subquestion.ts a [examples](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

"

### Eines

El SubQuestionQueryEngine s'implementa amb eines. La idea bàsica de les eines és que són opcions executables per al gran model de llenguatge. En aquest cas, el nostre SubQuestionQueryEngine es basa en QueryEngineTool, que, com podeu imaginar, és una eina per executar consultes en un QueryEngine. Això ens permet donar al model una opció per consultar diferents documents per a diferents preguntes, per exemple. També podeu imaginar que el SubQuestionQueryEngine podria utilitzar una eina que cerqui alguna cosa a la web o obtingui una resposta utilitzant Wolfram Alpha.

Podeu obtenir més informació sobre les eines consultant la documentació de LlamaIndex Python a https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## Referència de l'API

- [Motor de Consulta del Recuperador (RetrieverQueryEngine)](../../api/classes/RetrieverQueryEngine.md)
- [Motor de Consulta de Subpreguntes (SubQuestionQueryEngine)](../../api/classes/SubQuestionQueryEngine.md)
- [Eina del Motor de Consulta (QueryEngineTool)](../../api/interfaces/QueryEngineTool.md)
