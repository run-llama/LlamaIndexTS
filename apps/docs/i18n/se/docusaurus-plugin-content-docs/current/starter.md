---
sidebar_position: 2
---

# Uvodni tutorijal

`Ova dokumentacija je automatski prevedena i može sadržati greške. Ne oklevajte da otvorite Pull Request za predlaganje izmena.`

Kada ste [instalirali LlamaIndex.TS pomoću NPM-a](installation) i podesili svoj OpenAI ključ, spremni ste da započnete svoju prvu aplikaciju:

U novom folderu:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # ako je potrebno
```

Kreirajte fajl `example.ts`. Ovaj kod će učitati neke primere podataka, kreirati dokument, indeksirati ga (što stvara ugnežđivanja pomoću OpenAI) i zatim kreirati upitni motor za odgovaranje na pitanja o podacima.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Učitaj eseje iz abramov.txt u Node-u
  const eseji = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Kreiraj objekat Document sa esejom
  const dokument = new Document({ text: eseji });

  // Podeli tekst i kreiraj ugnežđivanja. Sačuvaj ih u VectorStoreIndex-u
  const indeks = await VectorStoreIndex.fromDocuments([dokument]);

  // Upitaj indeks
  const upitniMotor = indeks.asQueryEngine();
  const odgovor = await upitniMotor.query("Šta je autor radio na fakultetu?");

  // Ispisi odgovor
  console.log(odgovor.toString());
}

main();
```

Zatim ga možete pokrenuti koristeći

```bash
npx ts-node example.ts
```

Spremni da naučite više? Pogledajte naš NextJS playground na https://llama-playground.vercel.app/. Izvorni kod je dostupan na https://github.com/run-llama/ts-playground

"
