---
sidebar_position: 2
---

# Startguide

`Denna dokumentation har översatts automatiskt och kan innehålla fel. Tveka inte att öppna en Pull Request för att föreslå ändringar.`

När du har [installerat LlamaIndex.TS med hjälp av NPM](installation) och konfigurerat din OpenAI-nyckel är du redo att starta din första app:

I en ny mapp:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # om det behövs
```

Skapa filen `example.ts`. Den här koden kommer att ladda in några exempeldata, skapa ett dokument, indexera det (vilket skapar inbäddningar med hjälp av OpenAI) och sedan skapa en frågemotor för att svara på frågor om datan.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Ladda in essän från abramov.txt i Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Skapa ett Document-objekt med essän
  const document = new Document({ text: essay });

  // Dela upp texten och skapa inbäddningar. Spara dem i en VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Fråga indexet
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query(
    "Vad gjorde författaren på college?",
  );

  // Skriv ut svaret
  console.log(response.toString());
}

main();
```

Sedan kan du köra det med

```bash
npx ts-node example.ts
```

Redo att lära dig mer? Kolla in vår NextJS-lekplats på https://llama-playground.vercel.app/. Källkoden finns tillgänglig på https://github.com/run-llama/ts-playground

"
