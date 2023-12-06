---
sidebar_position: 5
---

# Ανάκτηση

`Αυτό το έγγραφο έχει μεταφραστεί αυτόματα και μπορεί να περιέχει λάθη. Μη διστάσετε να ανοίξετε ένα Pull Request για να προτείνετε αλλαγές.`

Ένας ανάκτης στο LlamaIndex είναι αυτός που χρησιμοποιείται για να ανακτήσει τα `Node`s από ένα ευρετήριο χρησιμοποιώντας μια συμβολοσειρά ερωτήματος. Ένας `VectorIndexRetriever` θα ανακτήσει τα πιο παρόμοια κόμβους top-k. Από την άλλη, ένας `SummaryIndexRetriever` θα ανακτήσει όλους τους κόμβους ανεξάρτητα από το ερώτημα.

```typescript
const retriever = vector_index.asRetriever();
retriever.similarityTopK = 3;

// Ανάκτηση κόμβων!
const nodesWithScore = await retriever.retrieve("συμβολοσειρά ερωτήματος");
```

## Αναφορά API

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)

"
