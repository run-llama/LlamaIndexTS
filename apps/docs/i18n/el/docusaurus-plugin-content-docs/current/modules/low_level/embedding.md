---
sidebar_position: 1
---

# Ενσωμάτωση

`Αυτό το έγγραφο έχει μεταφραστεί αυτόματα και μπορεί να περιέχει λάθη. Μη διστάσετε να ανοίξετε ένα Pull Request για να προτείνετε αλλαγές.`

Το μοντέλο ενσωμάτωσης στο LlamaIndex είναι υπεύθυνο για τη δημιουργία αριθμητικών αναπαραστάσεων του κειμένου. Από προεπιλογή, το LlamaIndex θα χρησιμοποιήσει το μοντέλο `text-embedding-ada-002` από το OpenAI.

Αυτό μπορεί να οριστεί ρητά στο αντικείμενο `ServiceContext`.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## Αναφορά API

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
