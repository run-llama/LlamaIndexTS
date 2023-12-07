---
sidebar_position: 0
---

# Dokumen dan Node

`Dokumentasi ini telah diterjemahkan secara otomatis dan mungkin mengandung kesalahan. Jangan ragu untuk membuka Pull Request untuk mengusulkan perubahan.`

`Dokumen` dan `Node` adalah blok dasar dari setiap indeks. Meskipun API untuk objek-objek ini mirip, objek `Dokumen` mewakili seluruh file, sedangkan `Node` adalah bagian-bagian kecil dari dokumen asli tersebut, yang cocok untuk LLM dan Q&A.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "teks", metadata: { key: "val" } });
```

## Referensi API

- [Dokumen](../../api/classes/Document.md)
- [TextNode](../../api/classes/TextNode.md)

"
