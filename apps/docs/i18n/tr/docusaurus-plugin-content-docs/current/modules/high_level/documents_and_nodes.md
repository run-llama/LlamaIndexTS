---
sidebar_position: 0
---

# Belgeler ve Düğümler

`Bu belge otomatik olarak çevrilmiştir ve hatalar içerebilir. Değişiklik önermek için bir Pull Request açmaktan çekinmeyin.`

`Belge`ler ve `Düğüm`ler, herhangi bir dizinin temel yapı taşlarıdır. Bu nesnelerin API'si benzer olsa da, `Belge` nesneleri tüm dosyaları temsil ederken, `Düğüm`ler, orijinal belgenin daha küçük parçalarıdır ve LLM ve Q&A için uygundur.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "metin", metadata: { key: "val" } });
```

## API Referansı

- [Belge](../../api/classes/Document.md)
- [TextNode](../../api/classes/TextNode.md)

"
