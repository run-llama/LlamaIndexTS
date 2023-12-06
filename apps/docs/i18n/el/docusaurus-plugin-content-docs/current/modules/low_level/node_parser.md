---
sidebar_position: 3
---

# NodeParser (Αναλυτής Κόμβων)

`Αυτό το έγγραφο έχει μεταφραστεί αυτόματα και μπορεί να περιέχει λάθη. Μη διστάσετε να ανοίξετε ένα Pull Request για να προτείνετε αλλαγές.`

Ο `NodeParser` στο LlamaIndex είναι υπεύθυνος για τον διαχωρισμό των αντικειμένων `Document` σε πιο διαχειρίσιμα αντικείμενα `Node`. Όταν καλείτε την `.fromDocuments()`, ο `NodeParser` από το `ServiceContext` χρησιμοποιείται για να το κάνει αυτό αυτόματα για εσάς. Εναλλακτικά, μπορείτε να το χρησιμοποιήσετε για να διαχωρίσετε τα έγγραφα εκ των προτέρων.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Είμαι 10 χρονών. Ο John είναι 20 χρονών." }),
]);
```

## TextSplitter (Διαχωριστής Κειμένου)

Ο κάτωθι διαχωριστής κειμένου θα διαχωρίσει το κείμενο σε προτάσεις. Μπορεί επίσης να χρησιμοποιηθεί ως αυτόνομη μονάδα για τον διαχωρισμό ακατέργαστου κειμένου.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Γεια σου Κόσμε");
```

"

## Αναφορά API

- [SimpleNodeParser (Απλός Αναλυτής Κόμβων)](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter (Διαχωριστής Προτάσεων)](../../api/classes/SentenceSplitter.md)

"
