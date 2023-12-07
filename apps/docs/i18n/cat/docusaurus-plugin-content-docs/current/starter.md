---
sidebar_position: 2
---

# Tutorial d'Inici

`Aquesta documentació s'ha traduït automàticament i pot contenir errors. No dubteu a obrir una Pull Request per suggerir canvis.`

Un cop hagueu [instal·lat LlamaIndex.TS utilitzant NPM](installation) i hagueu configurat la vostra clau d'OpenAI, esteu preparats per començar la vostra primera aplicació:

En una nova carpeta:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # si cal
```

Creeu el fitxer `example.ts`. Aquest codi carregarà algunes dades d'exemple, crearà un document, l'indexarà (que crea incrustacions utilitzant OpenAI) i després crearà un motor de consulta per respondre preguntes sobre les dades.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Carrega l'assaig des de abramov.txt a Node
  const assaig = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Crea un objecte Document amb l'assaig
  const document = new Document({ text: assaig });

  // Divideix el text i crea incrustacions. Emmagatzema-les en un VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Consulta l'índex
  const motorConsulta = index.asQueryEngine();
  const resposta = await motorConsulta.query(
    "Què va fer l'autor a la universitat?",
  );

  // Mostra la resposta
  console.log(resposta.toString());
}

main();
```

A continuació, podeu executar-lo utilitzant

```bash
npx ts-node example.ts
```

Preparat per aprendre més? Consulteu el nostre espai de jocs NextJS a https://llama-playground.vercel.app/. El codi font està disponible a https://github.com/run-llama/ts-playground

"
