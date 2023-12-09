---
sidebar_position: 2
---

# Tutoriel de Démarrage

Une fois que vous avez [installé LlamaIndex.TS en utilisant NPM](installation) et configuré votre clé OpenAI, vous êtes prêt à démarrer votre première application :

Dans un nouveau dossier :

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # si nécessaire
```

Créez le fichier `example.ts`. Ce code chargera des données d'exemple, créera un document, les indexera (ce qui crée des embeddings en utilisant OpenAI), puis créera un moteur de requête pour répondre aux questions sur les données.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Charger l'essai depuis abramov.txt dans Node
  const essai = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Créer un objet Document avec l'essai
  const document = new Document({ text: essai });

  // Diviser le texte et créer des embeddings. Les stocker dans un VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Interroger l'index
  const moteurRequete = index.asQueryEngine();
  const réponse = await moteurRequete.query(
    "Qu'a fait l'auteur à l'université ?",
  );

  // Afficher la réponse
  console.log(réponse.toString());
}

main();
```

Ensuite, vous pouvez l'exécuter en utilisant

```bash
npx ts-node example.ts
```

Prêt à en apprendre davantage ? Consultez notre espace de jeu NextJS sur https://llama-playground.vercel.app/. Le code source est disponible sur https://github.com/run-llama/ts-playground
