---
sidebar_position: 2
---

# Tutorial di Avvio

`Questa documentazione è stata tradotta automaticamente e può contenere errori. Non esitare ad aprire una Pull Request per suggerire modifiche.`

Una volta che hai [installato LlamaIndex.TS utilizzando NPM](installation) e configurato la tua chiave OpenAI, sei pronto per avviare la tua prima app:

In una nuova cartella:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # se necessario
```

Crea il file `example.ts`. Questo codice caricherà alcuni dati di esempio, creerà un documento, lo indicherà (creando embedding utilizzando OpenAI) e quindi creerà un motore di interrogazione per rispondere alle domande sui dati.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Carica l'articolo da abramov.txt in Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Crea un oggetto Document con l'articolo
  const document = new Document({ text: essay });

  // Dividi il testo e crea gli embedding. Salvali in un VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Interroga l'indice
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query(
    "Cosa ha fatto l'autore all'università?",
  );

  // Stampa la risposta
  console.log(response.toString());
}

main();
```

Successivamente puoi eseguirlo utilizzando

```bash
npx ts-node example.ts
```

Pronto per saperne di più? Dai un'occhiata al nostro playground NextJS su https://llama-playground.vercel.app/. Il codice sorgente è disponibile su https://github.com/run-llama/ts-playground

"
