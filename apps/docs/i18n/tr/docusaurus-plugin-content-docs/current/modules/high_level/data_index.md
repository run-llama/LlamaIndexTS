---
sidebar_position: 2
---

# İndeks

`Bu belge otomatik olarak çevrilmiştir ve hatalar içerebilir. Değişiklik önermek için bir Pull Request açmaktan çekinmeyin.`

Bir indeks, verilerinizin temel konteyneri ve organizasyonudur. LlamaIndex.TS, iki indeksi destekler:

- `VectorStoreIndex` - yanıt oluşturulurken en iyi k `Node`'ları LLM'ye gönderir. Varsayılan en iyi k değeri 2'dir.
- `SummaryIndex` - yanıt oluşturmak için indeksteki her `Node`'u LLM'ye gönderir.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "test" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## API Referansı

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)

"
