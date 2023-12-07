---
sidebar_position: 1
---

# Αναγνώστης / Φορτωτής

`Αυτό το έγγραφο έχει μεταφραστεί αυτόματα και μπορεί να περιέχει λάθη. Μη διστάσετε να ανοίξετε ένα Pull Request για να προτείνετε αλλαγές.`

Το LlamaIndex.TS υποστηρίζει την εύκολη φόρτωση αρχείων από φακέλους χρησιμοποιώντας την κλάση `SimpleDirectoryReader`. Αυτή τη στιγμή, υποστηρίζονται αρχεία `.txt`, `.pdf`, `.csv`, `.md` και `.docx`, με περισσότερα να προγραμματίζονται για το μέλλον!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## Αναφορά API

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)

"
