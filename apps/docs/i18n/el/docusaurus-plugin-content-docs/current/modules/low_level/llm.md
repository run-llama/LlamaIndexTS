---
sidebar_position: 0
---

# LLM

`Αυτό το έγγραφο έχει μεταφραστεί αυτόματα και μπορεί να περιέχει λάθη. Μη διστάσετε να ανοίξετε ένα Pull Request για να προτείνετε αλλαγές.`

Το LLM είναι υπεύθυνο για την ανάγνωση κειμένου και τη δημιουργία φυσικής γλώσσας απαντήσεων σε ερωτήματα. Από προεπιλογή, το LlamaIndex.TS χρησιμοποιεί το `gpt-3.5-turbo`.

Το LLM μπορεί να οριστεί ρητά στο αντικείμενο `ServiceContext`.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## Αναφορά API

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
