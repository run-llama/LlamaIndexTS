---
sidebar_position: 2
---

# Úvodný návod

`Táto dokumentácia bola automaticky preložená a môže obsahovať chyby. Neváhajte otvoriť Pull Request na navrhnutie zmien.`

Ak ste [nainštalovali LlamaIndex.TS pomocou NPM](installation) a nastavili svoj OpenAI kľúč, ste pripravení začať s vašou prvou aplikáciou:

Vytvorte nový priečinok:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # ak je potrebné
```

Vytvorte súbor `example.ts`. Tento kód načíta niektoré príkladové údaje, vytvorí dokument, vytvorí index (ktorý vytvára vektory pomocou OpenAI) a potom vytvorí dotazovací engine na zodpovedanie otázok o údajoch.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Načítajte esej z abramov.txt v Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Vytvorte objekt Document s esejom
  const document = new Document({ text: essay });

  // Rozdeľte text a vytvorte vektory. Uložte ich do VectorStoreIndexu
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Dotaz na index
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query("Čo autor robil na vysokej škole?");

  // Výstup odpovede
  console.log(response.toString());
}

main();
```

Potom ho môžete spustiť pomocou

```bash
npx ts-node example.ts
```

Ste pripravení na ďalšie informácie? Pozrite si našu NextJS prehrávačku na adrese https://llama-playground.vercel.app/. Zdrojový kód je k dispozícii na adrese https://github.com/run-llama/ts-playground

"
