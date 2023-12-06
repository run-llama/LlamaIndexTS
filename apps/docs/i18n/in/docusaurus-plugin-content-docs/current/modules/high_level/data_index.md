---
sidebar_position: 2
---

# Indeks

`Dokumentasi ini telah diterjemahkan secara otomatis dan mungkin mengandung kesalahan. Jangan ragu untuk membuka Pull Request untuk mengusulkan perubahan.`

Indeks adalah wadah dasar dan organisasi untuk data Anda. LlamaIndex.TS mendukung dua jenis indeks:

- `VectorStoreIndex` - akan mengirimkan `Node` teratas ke LLM saat menghasilkan respons. Top-k default adalah 2.
- `SummaryIndex` - akan mengirimkan setiap `Node` dalam indeks ke LLM untuk menghasilkan respons.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## Referensi API

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)
