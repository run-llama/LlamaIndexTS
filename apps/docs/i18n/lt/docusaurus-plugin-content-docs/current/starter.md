---
sidebar_position: 2
---

# Pradžios vadovas

`Ši dokumentacija buvo automatiškai išversta ir gali turėti klaidų. Nedvejodami atidarykite Pull Request, jei norite pasiūlyti pakeitimus.`

Kai jūs [įdiegėte LlamaIndex.TS naudodami NPM](installation) ir sukonfigūravote savo OpenAI raktą, jūs esate pasiruošę pradėti savo pirmąją programą:

Naujame aplanke:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # jei reikia
```

Sukurkite failą `example.ts`. Šis kodas įkels keletą pavyzdinių duomenų, sukurs dokumentą, jį indeksuos (kuriant įdėjimus naudojant OpenAI) ir tada sukurs užklausos variklį, kuris atsakys į duomenų klausimus.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Įkelkite esė iš abramov.txt naudojant Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Sukurkite dokumento objektą su esė
  const document = new Document({ text: essay });

  // Padalinkite tekstą ir sukurkite įdėjimus. Saugokite juos vektorių saugykloje
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Užklauskite indekso
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query("Ką autorius darė koledže?");

  // Išvesti atsakymą
  console.log(response.toString());
}

main();
```

Tada galite paleisti jį naudodami

```bash
npx ts-node example.ts
```

Pasiruošęs sužinoti daugiau? Patikrinkite mūsų NextJS žaidimų aikštelę adresu https://llama-playground.vercel.app/. Šaltinis yra prieinamas adresu https://github.com/run-llama/ts-playground

"
