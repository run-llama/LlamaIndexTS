---
sidebar_position: 2
---

# Samouczek dla początkujących

`Ta dokumentacja została przetłumaczona automatycznie i może zawierać błędy. Nie wahaj się otworzyć Pull Request, aby zaproponować zmiany.`

Po zainstalowaniu [LlamaIndex.TS przy użyciu NPM](installation) i skonfigurowaniu klucza OpenAI, jesteś gotowy, aby rozpocząć pracę nad swoją pierwszą aplikacją:

W nowym folderze:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # jeśli jest to konieczne
```

Utwórz plik `example.ts`. Ten kod załaduje przykładowe dane, utworzy dokument, zaindeksuje go (co utworzy osadzenia przy użyciu OpenAI), a następnie utworzy silnik zapytań, który będzie odpowiadał na pytania dotyczące danych.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Załaduj esej z pliku abramov.txt w Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Utwórz obiekt dokumentu z esejem
  const document = new Document({ text: essay });

  // Podziel tekst i utwórz osadzenia. Przechowuj je w indeksie VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Zapytaj indeks
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query("Co autor robił na studiach?");

  // Wyświetl odpowiedź
  console.log(response.toString());
}

main();
```

Następnie możesz go uruchomić za pomocą

```bash
npx ts-node example.ts
```

Gotowy, aby dowiedzieć się więcej? Sprawdź nasze środowisko NextJS w https://llama-playground.vercel.app/. Źródło jest dostępne na https://github.com/run-llama/ts-playground

"
