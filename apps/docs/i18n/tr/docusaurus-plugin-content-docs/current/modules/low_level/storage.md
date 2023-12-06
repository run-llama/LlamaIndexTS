---
sidebar_position: 7
---

# Depolama

`Bu belge otomatik olarak çevrilmiştir ve hatalar içerebilir. Değişiklik önermek için bir Pull Request açmaktan çekinmeyin.`

LlamaIndex.TS'de depolama otomatik olarak çalışır, bir `StorageContext` nesnesini yapılandırdıktan sonra. Sadece `persistDir`'yi yapılandırın ve bir indekse ekleyin.

Şu anda, yalnızca diskten kaydetme ve yükleme desteklenmektedir, gelecekteki entegrasyonlar planlanmaktadır!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Test Metni" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## API Referansı

- [StorageContext](../../api/interfaces/StorageContext.md)

"
