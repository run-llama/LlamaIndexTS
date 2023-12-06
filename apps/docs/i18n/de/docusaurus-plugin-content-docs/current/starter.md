---
sidebar_position: 2
---

# Starter-Tutorial

`Diese Dokumentation wurde automatisch übersetzt und kann Fehler enthalten. Zögern Sie nicht, einen Pull Request zu öffnen, um Änderungen vorzuschlagen.`

Sobald Sie [LlamaIndex.TS mit NPM installiert](installation) und Ihren OpenAI-Schlüssel eingerichtet haben, sind Sie bereit, Ihre erste App zu starten:

In einem neuen Ordner:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # falls erforderlich
```

Erstellen Sie die Datei `example.ts`. Dieser Code lädt einige Beispieldaten, erstellt ein Dokument, indexiert es (wodurch Embeddings mit OpenAI erstellt werden) und erstellt dann eine Abfrage-Engine, um Fragen zu den Daten zu beantworten.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Lade den Aufsatz aus abramov.txt in Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Erstelle ein Document-Objekt mit dem Aufsatz
  const document = new Document({ text: essay });

  // Teile den Text auf und erstelle Embeddings. Speichere sie in einem VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Abfrage des Index
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query(
    "Was hat der Autor im College gemacht?",
  );

  // Ausgabe der Antwort
  console.log(response.toString());
}

main();
```

Dann können Sie es ausführen mit

```bash
npx ts-node example.ts
```

Bereit, mehr zu lernen? Schauen Sie sich unseren NextJS-Playground unter https://llama-playground.vercel.app/ an. Der Quellcode ist unter https://github.com/run-llama/ts-playground verfügbar.

"
