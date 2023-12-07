---
sidebar_position: 2
---

# Ευρετήριο

`Αυτό το έγγραφο έχει μεταφραστεί αυτόματα και μπορεί να περιέχει λάθη. Μη διστάσετε να ανοίξετε ένα Pull Request για να προτείνετε αλλαγές.`

Ένα ευρετήριο είναι ο βασικός δοχείο και οργανωτής για τα δεδομένα σας. Το LlamaIndex.TS υποστηρίζει δύο ευρετήρια:

- `VectorStoreIndex` - θα στείλει τα κορυφαία `Node`s στο LLM κατά τη δημιουργία μιας απάντησης. Το προεπιλεγμένο top-k είναι 2.
- `SummaryIndex` - θα στείλει κάθε `Node` στο ευρετήριο στο LLM για να δημιουργήσει μια απάντηση.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## Αναφορά API

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
