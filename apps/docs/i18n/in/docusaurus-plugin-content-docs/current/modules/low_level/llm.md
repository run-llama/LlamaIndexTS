---
sidebar_position: 0
---

# LLM

`Dokumentasi ini telah diterjemahkan secara otomatis dan mungkin mengandung kesalahan. Jangan ragu untuk membuka Pull Request untuk mengusulkan perubahan.`

LLM bertanggung jawab untuk membaca teks dan menghasilkan respons bahasa alami terhadap pertanyaan. Secara default, LlamaIndex.TS menggunakan `gpt-3.5-turbo`.

LLM dapat secara eksplisit diatur dalam objek `ServiceContext`.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## Referensi API

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
