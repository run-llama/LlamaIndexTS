---
sidebar_position: 2
---

# Aloitusopas

`Tämä dokumentaatio on käännetty automaattisesti ja se saattaa sisältää virheitä. Älä epäröi avata Pull Requestia ehdottaaksesi muutoksia.`

Kun olet [asentanut LlamaIndex.TS:n käyttäen NPM:ää](asennus) ja määrittänyt OpenAI-avaimen, olet valmis aloittamaan ensimmäisen sovelluksesi:

Uudessa kansiossa:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # tarvittaessa
```

Luo tiedosto `example.ts`. Tämä koodi lataa esimerkkidataa, luo dokumentin, indeksoi sen (luo upotuksia käyttäen OpenAI:ta) ja luo sitten kyselymoottorin vastaamaan kysymyksiin tiedosta.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Lataa essee abramov.txt-tiedostosta Node:ssa
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Luo Document-objekti esseellä
  const document = new Document({ text: essay });

  // Jaa teksti ja luo upotuksia. Tallenna ne VectorStoreIndexiin
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Kysely indeksille
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query(
    "Mitä kirjoittaja teki yliopistossa?",
  );

  // Tulosta vastaus
  console.log(response.toString());
}

main();
```

Voit sitten ajaa sen käyttäen

```bash
npx ts-node example.ts
```

Valmis oppimaan lisää? Tutustu NextJS-leikkikenttäämme osoitteessa https://llama-playground.vercel.app/. Lähdekoodi on saatavilla osoitteessa https://github.com/run-llama/ts-playground.

"
