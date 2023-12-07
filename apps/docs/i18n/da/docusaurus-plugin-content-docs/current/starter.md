---
sidebar_position: 2
---

# Startvejledning

`Denne dokumentation er blevet automatisk oversat og kan indeholde fejl. Tøv ikke med at åbne en Pull Request for at foreslå ændringer.`

Når du har [installeret LlamaIndex.TS ved hjælp af NPM](installation) og har konfigureret din OpenAI-nøgle, er du klar til at starte din første app:

I en ny mappe:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # hvis det er nødvendigt
```

Opret filen `example.ts`. Denne kode vil indlæse nogle eksempeldata, oprette et dokument, indeksere det (som opretter indlejringer ved hjælp af OpenAI) og derefter oprette en forespørgselsmotor til at besvare spørgsmål om dataene.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Indlæs essay fra abramov.txt i Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Opret Document-objekt med essay
  const document = new Document({ text: essay });

  // Opdel tekst og opret indlejringer. Gem dem i en VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Forespørg på indekset
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query(
    "Hvad gjorde forfatteren på college?",
  );

  // Vis svar
  console.log(response.toString());
}

main();
```

Derefter kan du køre det ved hjælp af

```bash
npx ts-node example.ts
```

Klar til at lære mere? Tjek vores NextJS-legeplads på https://llama-playground.vercel.app/. Kildekoden er tilgængelig på https://github.com/run-llama/ts-playground

"
