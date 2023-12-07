---
sidebar_position: 2
---

# Kezdő útmutató

`Ezt a dokumentációt automatikusan fordították le, és tartalmazhat hibákat. Ne habozzon nyitni egy Pull Requestet a változtatások javasolására.`

Miután [telepítette a LlamaIndex.TS-t az NPM segítségével](installation) és beállította az OpenAI kulcsát, már készen áll az első alkalmazásának elindítására:

Egy új mappában:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # ha szükséges
```

Hozzon létre egy `example.ts` nevű fájlt. Ez a kód betölt néhány példaadatot, létrehoz egy dokumentumot, indexeli (amely az OpenAI-t használva beágyazásokat hoz létre), majd létrehoz egy lekérdezési motort adatainkkal kapcsolatos kérdések megválaszolásához.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Esszé betöltése az abramov.txt fájlból Node-ban
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Dokumentum objektum létrehozása az esszével
  const document = new Document({ text: essay });

  // Szöveg felosztása és beágyazások létrehozása. Tárolás egy VectorStoreIndex-ben
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Lekérdezés az indexben
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query("Mit csinált az író az egyetemen?");

  // Válasz kimenete
  console.log(response.toString());
}

main();
```

Ezután futtathatja a következő paranccsal:

```bash
npx ts-node example.ts
```

Készen áll a további tanulásra? Nézze meg a NextJS játszótérünket a https://llama-playground.vercel.app/ oldalon. A forráskód elérhető a https://github.com/run-llama/ts-playground címen.

"
