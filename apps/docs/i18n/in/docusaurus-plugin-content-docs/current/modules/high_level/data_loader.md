---
sidebar_position: 1
---

# Pemutar / Pemuat

`Dokumentasi ini telah diterjemahkan secara otomatis dan mungkin mengandung kesalahan. Jangan ragu untuk membuka Pull Request untuk mengusulkan perubahan.`

LlamaIndex.TS mendukung pengambilan file dari folder dengan mudah menggunakan kelas `SimpleDirectoryReader`. Saat ini, file `.txt`, `.pdf`, `.csv`, `.md`, dan `.docx` didukung, dengan rencana untuk menambahkan lebih banyak di masa depan!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## Referensi API

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)
