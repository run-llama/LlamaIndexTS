---
sidebar_position: 2
---

# Οδηγός Έναρξης

`Αυτό το έγγραφο έχει μεταφραστεί αυτόματα και μπορεί να περιέχει λάθη. Μη διστάσετε να ανοίξετε ένα Pull Request για να προτείνετε αλλαγές.`

Αφού [εγκαταστήσετε το LlamaIndex.TS χρησιμοποιώντας το NPM](installation) και ρυθμίσετε το κλειδί σας για το OpenAI, είστε έτοιμοι να ξεκινήσετε την πρώτη σας εφαρμογή:

Σε ένα νέο φάκελο:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # αν χρειαστεί
```

Δημιουργήστε το αρχείο `example.ts`. Αυτός ο κώδικας θα φορτώσει μερικά παραδείγματα δεδομένων, θα δημιουργήσει ένα έγγραφο, θα το ευρετηριάσει (δημιουργώντας embeddings χρησιμοποιώντας το OpenAI) και στη συνέχεια θα δημιουργήσει έναν μηχανισμό ερωτήσεων για να απαντάει σε ερωτήσεις σχετικά με τα δεδομένα.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Φορτώστε το δοκίμιο από το abramov.txt στο Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Δημιουργήστε ένα αντικείμενο Document με το δοκίμιο
  const document = new Document({ text: essay });

  // Διαχωρίστε το κείμενο και δημιουργήστε τα embeddings. Αποθηκεύστε τα σε ένα VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Ερωτήστε το ευρετήριο
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query(
    "Τι έκανε ο συγγραφέας στο κολέγιο;",
  );

  // Εμφάνιση της απάντησης
  console.log(response.toString());
}

main();
```

Στη συνέχεια, μπορείτε να το εκτελέσετε χρησιμοποιώντας

```bash
npx ts-node example.ts
```

Έτοιμοι να μάθετε περισσότερα; Ελέγξτε το περιβάλλον μας για το NextJS στο https://llama-playground.vercel.app/. Ο πηγαίος κώδικας είναι διαθέσιμος στο https://github.com/run-llama/ts-playground
