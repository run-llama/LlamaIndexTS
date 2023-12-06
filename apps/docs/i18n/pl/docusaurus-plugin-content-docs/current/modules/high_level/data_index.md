---
sidebar_position: 2
---

# Indeks

`Ta dokumentacja została przetłumaczona automatycznie i może zawierać błędy. Nie wahaj się otworzyć Pull Request, aby zaproponować zmiany.`

Indeks to podstawowy kontener i organizacja dla Twoich danych. LlamaIndex.TS obsługuje dwa indeksy:

- `VectorStoreIndex` - wysyła do LLM (Llama Learning Machine) najlepsze `Node` w celu wygenerowania odpowiedzi. Domyślnie wybierane są 2 najlepsze wyniki.
- `SummaryIndex` - wysyła do LLM każdy `Node` w indeksie w celu wygenerowania odpowiedzi.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## Dokumentacja API

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
