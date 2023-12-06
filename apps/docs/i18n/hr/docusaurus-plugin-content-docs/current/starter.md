---
sidebar_position: 2
---

# Uvodni vodič

`Ova dokumentacija je automatski prevedena i može sadržavati greške. Ne ustručavajte se otvoriti Pull Request za predlaganje promjena.`

Nakon što ste [instalirali LlamaIndex.TS pomoću NPM-a](installation) i postavili svoj OpenAI ključ, spremni ste za pokretanje svoje prve aplikacije:

U novom direktoriju:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # ako je potrebno
```

Kreirajte datoteku `primjer.ts`. Ovaj kod će učitati neke primjer podatke, kreirati dokument, indeksirati ga (što stvara ugrađivanja pomoću OpenAI-a) i zatim stvara upitni motor za odgovaranje na pitanja o podacima.

```ts
// primjer.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Učitaj eseje iz abramov.txt u Node-u
  const eseji = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Kreiraj objekt Dokument s esejeima
  const dokument = new Document({ text: eseji });

  // Podijeli tekst i stvori ugrađivanja. Spremi ih u VectorStoreIndex
  const indeks = await VectorStoreIndex.fromDocuments([dokument]);

  // Upitaj indeks
  const upitniMotor = indeks.asQueryEngine();
  const odgovor = await upitniMotor.query("Što je autor radio na fakultetu?");

  // Ispiši odgovor
  console.log(odgovor.toString());
}

main();
```

Zatim ga možete pokrenuti koristeći

```bash
npx ts-node primjer.ts
```

Spremni za više informacija? Provjerite naš NextJS igralište na https://llama-playground.vercel.app/. Izvorni kod je dostupan na https://github.com/run-llama/ts-playground

"
