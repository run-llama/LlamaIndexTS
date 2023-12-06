---
sidebar_position: 5
---

# Atgūtājs

`Šis dokuments ir automātiski tulkots un var saturēt kļūdas. Nevilciniet atvērt Pull Request, lai ierosinātu izmaiņas.`

Atgūtājs LlamaIndex ir tas, kas tiek izmantots, lai iegūtu `Node` no indeksa, izmantojot vaicājuma virkni. `VectorIndexRetriever` iegūs vislīdzīgākos virsotnes k. Tāpat `SummaryIndexRetriever` iegūs visus mezglus neatkarīgi no vaicājuma.

```typescript
const atgūtājs = vector_index.asRetriever();
atgūtājs.līdzībaTopK = 3;

// Iegūt mezglus!
const mezgliArRezultātu = await atgūtājs.atgūt("vaicājuma virkne");
```

## API atsauce

- [SummaryIndexRetriever](../../api/classes/SummaryIndexRetriever.md)
- [SummaryIndexLLMRetriever](../../api/classes/SummaryIndexLLMRetriever.md)
- [VectorIndexRetriever](../../api/classes/VectorIndexRetriever.md)
