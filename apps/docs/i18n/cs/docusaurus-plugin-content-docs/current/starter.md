---
sidebar_position: 2
---

# Úvodní tutoriál

`Tato dokumentace byla automaticky přeložena a může obsahovat chyby. Neváhejte otevřít Pull Request pro navrhování změn.`

Jakmile jste [nainstalovali LlamaIndex.TS pomocí NPM](installation) a nastavili svůj OpenAI klíč, jste připraveni spustit svou první aplikaci:

V novém adresáři:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # pokud je to potřeba
```

Vytvořte soubor `example.ts`. Tento kód načte některá ukázková data, vytvoří dokument, vytvoří index (který vytváří vnoření pomocí OpenAI) a poté vytvoří dotazovací engine pro odpovědi na otázky o datech.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Načtěte esej z abramov.txt v Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Vytvořte objekt Document s esejem
  const document = new Document({ text: essay });

  // Rozdělte text a vytvořte vnoření. Uložte je do VectorStoreIndexu
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Dotaz na index
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query("Co autor dělal na vysoké škole?");

  // Výstup odpovědi
  console.log(response.toString());
}

main();
```

Poté jej můžete spustit pomocí

```bash
npx ts-node example.ts
```

Připraveni se dozvědět více? Podívejte se na naše NextJS hřiště na adrese https://llama-playground.vercel.app/. Zdrojový kód je k dispozici na adrese https://github.com/run-llama/ts-playground

"
