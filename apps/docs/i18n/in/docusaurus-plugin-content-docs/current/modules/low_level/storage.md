---
sidebar_position: 7
---

`Dokumentasi ini telah diterjemahkan secara otomatis dan mungkin mengandung kesalahan. Jangan ragu untuk membuka Pull Request untuk mengusulkan perubahan.`

# Penyimpanan

Penyimpanan di LlamaIndex.TS bekerja secara otomatis setelah Anda mengonfigurasi objek `StorageContext`. Cukup konfigurasikan `persistDir` dan lampirkan ke sebuah indeks.

Saat ini, hanya penyimpanan dan pengambilan dari disk yang didukung, dengan integrasi masa depan yang direncanakan!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Test Text" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## Referensi API

- [StorageContext](../../api/interfaces/StorageContext.md)

"
