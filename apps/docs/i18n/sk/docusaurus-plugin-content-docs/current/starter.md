---
sidebar_position: 2
---

# Vodič za začetek

`Ta dokumentacija je bila samodejno prevedena in lahko vsebuje napake. Ne oklevajte odpreti Pull Request za predlaganje sprememb.`

Ko ste [namestili LlamaIndex.TS z uporabo NPM](namestitev) in nastavili svoj OpenAI ključ, ste pripravljeni za zagon prve aplikacije:

V novi mapi:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # če je potrebno
```

Ustvarite datoteko `example.ts`. Ta koda bo naložila nekaj primerov podatkov, ustvarila dokument, ga indeksirala (kar ustvari vložke z uporabo OpenAI) in nato ustvarila iskalni motor za odgovarjanje na vprašanja o podatkih.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Naloži eseje iz abramov.txt v Node
  const eseji = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Ustvari objekt dokumenta z eseji
  const dokument = new Document({ text: eseji });

  // Razdeli besedilo in ustvari vložke. Shranite jih v VectorStoreIndex
  const indeks = await VectorStoreIndex.fromDocuments([dokument]);

  // Poizvedujte indeks
  const iskalniMotor = indeks.asQueryEngine();
  const odgovor = await iskalniMotor.query("Kaj je avtor počel na fakulteti?");

  // Izpiši odgovor
  console.log(odgovor.toString());
}

main();
```

Nato ga lahko zaženete z uporabo

```bash
npx ts-node example.ts
```

Ste pripravljeni izvedeti več? Oglejte si našo NextJS igrišče na https://llama-playground.vercel.app/. Izvorna koda je na voljo na https://github.com/run-llama/ts-playground

"
