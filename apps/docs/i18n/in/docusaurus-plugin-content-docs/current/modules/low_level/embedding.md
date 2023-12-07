---
sidebar_position: 1
---

# Menyematkan (Embedding)

`Dokumentasi ini telah diterjemahkan secara otomatis dan mungkin mengandung kesalahan. Jangan ragu untuk membuka Pull Request untuk mengusulkan perubahan.`

Model penyemat di LlamaIndex bertanggung jawab untuk membuat representasi numerik dari teks. Secara default, LlamaIndex akan menggunakan model `text-embedding-ada-002` dari OpenAI.

Ini dapat secara eksplisit diatur dalam objek `ServiceContext`.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## Referensi API

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
