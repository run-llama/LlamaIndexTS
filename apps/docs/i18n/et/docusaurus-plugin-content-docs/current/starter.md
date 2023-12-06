---
sidebar_position: 2
---

# Alustamise õpetus

`See dokumentatsioon on tõlgitud automaatselt ja võib sisaldada vigu. Ärge kartke avada Pull Request, et pakkuda muudatusi.`

Kui olete [LlamaIndex.TS installinud NPM-i abil](installation) ja seadistanud oma OpenAI võtme, olete valmis oma esimest rakendust alustama:

Uues kaustas:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # vajadusel
```

Loo fail `example.ts`. See kood laadib mõned näidisandmed, loob dokumendi, indekseerib selle (kasutades OpenAI-ga loodud sisseehitatud andmeid) ja loob siis päringumootori, et vastata andmete kohta esitatud küsimustele.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Lae essee abramov.txt Node'ist
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Loo dokumendi objekt essee abil
  const document = new Document({ text: essay });

  // Jaga tekst ja loo sisseehitatud andmed. Salvesta need VectorStoreIndexisse
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Tee päring indeksisse
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query("Mida autor kolledžis tegi?");

  // Väljasta vastus
  console.log(response.toString());
}

main();
```

Seejärel saate selle käivitada järgmiselt

```bash
npx ts-node example.ts
```

Valmis rohkem õppima? Vaadake meie NextJS mänguväljakut aadressil https://llama-playground.vercel.app/. Lähtekood on saadaval aadressil https://github.com/run-llama/ts-playground

"
