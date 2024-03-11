---
sidebar_position: 4
---

# Μηχανή Συνομιλίας (ChatEngine)

`Αυτό το έγγραφο έχει μεταφραστεί αυτόματα και μπορεί να περιέχει λάθη. Μη διστάσετε να ανοίξετε ένα Pull Request για να προτείνετε αλλαγές.`

Η μηχανή συνομιλίας είναι ένας γρήγορος και απλός τρόπος για να συνομιλήσετε με τα δεδομένα στον δείκτη σας.

```typescript
const retriever = index.asRetriever();
const chatEngine = new ContextChatEngine({ retriever });

// ξεκινήστε τη συνομιλία
const response = await chatEngine.chat(query);
```

## Αναφορές Api

- [Μηχανή Συνομιλίας Περιβάλλοντος (ContextChatEngine)](../../api/classes/ContextChatEngine.md)
- [Μηχανή Συνομιλίας Συμπίεσης Ερωτήσεων (CondenseQuestionChatEngine)](../../api/classes/ContextChatEngine.md)
