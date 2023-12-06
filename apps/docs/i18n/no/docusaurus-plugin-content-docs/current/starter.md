---
sidebar_position: 2
---

# Startveiledning

`Denne dokumentasjonen har blitt automatisk oversatt og kan inneholde feil. Ikke nøl med å åpne en Pull Request for å foreslå endringer.`

Når du har [installert LlamaIndex.TS ved hjelp av NPM](installation) og satt opp din OpenAI-nøkkel, er du klar til å starte din første app:

I en ny mappe:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # hvis nødvendig
```

Opprett filen `example.ts`. Denne koden vil laste inn noen eksempeldata, opprette et dokument, indeksere det (som oppretter innebygde vektorer ved hjelp av OpenAI), og deretter opprette en spørringsmotor for å svare på spørsmål om dataene.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Last inn essay fra abramov.txt i Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Opprett Document-objekt med essay
  const document = new Document({ text: essay });

  // Del opp teksten og opprett innebygde vektorer. Lagre dem i en VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Spørr indeksen
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query(
    "Hva gjorde forfatteren på college?",
  );

  // Skriv ut responsen
  console.log(response.toString());
}

main();
```

Deretter kan du kjøre det ved å bruke

```bash
npx ts-node example.ts
```

Klar til å lære mer? Sjekk ut vår NextJS-lekeplass på https://llama-playground.vercel.app/. Kildekoden er tilgjengelig på https://github.com/run-llama/ts-playground

"
