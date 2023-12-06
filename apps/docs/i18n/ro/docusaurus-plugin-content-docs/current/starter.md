---
sidebar_position: 2
---

# Tutorial de pornire

`Această documentație a fost tradusă automat și poate conține erori. Nu ezitați să deschideți un Pull Request pentru a sugera modificări.`

După ce ați [instalat LlamaIndex.TS folosind NPM](installation) și ați configurat cheia OpenAI, sunteți gata să începeți prima aplicație:

Într-un folder nou:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # dacă este necesar
```

Creați fișierul `example.ts`. Acest cod va încărca niște date de exemplu, va crea un document, îl va indexa (creând înglobări folosind OpenAI) și apoi va crea un motor de interogare pentru a răspunde la întrebări despre date.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Încărcați eseul din abramov.txt în Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Creați obiectul Document cu eseul
  const document = new Document({ text: essay });

  // Împărțiți textul și creați înglobări. Stocați-le într-un VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Interogați indexul
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query("Ce a făcut autorul în facultate?");

  // Afișați răspunsul
  console.log(response.toString());
}

main();
```

Apoi puteți să-l rulați folosind

```bash
npx ts-node example.ts
```

Gata să aflați mai multe? Verificați playground-ul nostru NextJS la adresa https://llama-playground.vercel.app/. Sursa este disponibilă la adresa https://github.com/run-llama/ts-playground

"
