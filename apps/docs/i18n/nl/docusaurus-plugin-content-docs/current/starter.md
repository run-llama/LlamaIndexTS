---
sidebar_position: 2
---

# Startgids

`Deze documentatie is automatisch vertaald en kan fouten bevatten. Aarzel niet om een Pull Request te openen om wijzigingen voor te stellen.`

Zodra je [LlamaIndex.TS hebt geïnstalleerd met behulp van NPM](installation) en je OpenAI-sleutel hebt ingesteld, ben je klaar om je eerste app te starten:

In een nieuwe map:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # indien nodig
```

Maak het bestand `example.ts` aan. Deze code zal wat voorbeeldgegevens laden, een document maken, het indexeren (waarbij embeddings worden gemaakt met behulp van OpenAI) en vervolgens een query-engine maken om vragen over de gegevens te beantwoorden.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Laad essay vanuit abramov.txt in Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Maak een Document-object met het essay
  const document = new Document({ text: essay });

  // Split de tekst en maak embeddings. Sla ze op in een VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Doorzoek de index
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query(
    "Wat heeft de auteur op de universiteit gedaan?",
  );

  // Geef de respons weer
  console.log(response.toString());
}

main();
```

Je kunt het vervolgens uitvoeren met behulp van

```bash
npx ts-node example.ts
```

Klaar om meer te leren? Bekijk onze NextJS-speeltuin op https://llama-playground.vercel.app/. De broncode is beschikbaar op https://github.com/run-llama/ts-playground

"
