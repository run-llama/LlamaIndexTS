---
sidebar_position: 7
---

# Αποθήκευση (Storage)

`Αυτό το έγγραφο έχει μεταφραστεί αυτόματα και μπορεί να περιέχει λάθη. Μη διστάσετε να ανοίξετε ένα Pull Request για να προτείνετε αλλαγές.`

Η αποθήκευση στο LlamaIndex.TS λειτουργεί αυτόματα μόλις έχετε διαμορφώσει ένα αντικείμενο `StorageContext`. Απλά διαμορφώστε το `persistDir` και συνδέστε το με ένα δείκτη.

Αυτή τη στιγμή, υποστηρίζεται μόνο η αποθήκευση και φόρτωση από τον δίσκο, με μελλοντικές ενσωματώσεις που έχουν προγραμματιστεί!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Δοκιμαστικό Κείμενο" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## Αναφορά API (API Reference)

- [StorageContext](../../api/interfaces/StorageContext.md)

"
