---
sidebar_position: 2
---

# Ievadjuce

`Šis dokuments ir automātiski tulkots un var saturēt kļūdas. Nevilciniet atvērt Pull Request, lai ierosinātu izmaiņas.`

Kad esi [uzstādījis LlamaIndex.TS, izmantojot NPM](installation) un iestatījis savu OpenAI atslēgu, esi gatavs sākt savu pirmo lietotni:

Jaunā mapē:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # ja nepieciešams
```

Izveido failu `example.ts`. Šis kods ielādēs piemēra datus, izveidos dokumentu, indeksēs to (izmantojot OpenAI iegultās vērtības) un pēc tam izveidos vaicājumu dzinēju, lai atbildētu uz jautājumiem par datiem.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Ielādē eseju no abramov.txt Node vidē
  const eseja = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Izveido dokumenta objektu ar eseju
  const dokuments = new Document({ text: eseja });

  // Sadala tekstu un izveido iegultās vērtības. Saglabā tās VectorStoreIndex
  const indekss = await VectorStoreIndex.fromDocuments([dokuments]);

  // Veic vaicājumu indeksā
  const vaicājumaDzinējs = indekss.asQueryEngine();
  const atbilde = await vaicājumaDzinējs.query("Ko autors darīja koledžā?");

  // Izvada atbildi
  console.log(atbilde.toString());
}

main();
```

Tad to vari palaist, izmantojot

```bash
npx ts-node example.ts
```

Gatavs uzzināt vairāk? Apmeklē mūsu NextJS spēļu laukumu vietnē https://llama-playground.vercel.app/. Avots ir pieejams vietnē https://github.com/run-llama/ts-playground
