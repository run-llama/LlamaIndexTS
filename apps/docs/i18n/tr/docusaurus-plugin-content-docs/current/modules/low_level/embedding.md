---
sidebar_position: 1
---

# Gömme (Embedding)

`Bu belge otomatik olarak çevrilmiştir ve hatalar içerebilir. Değişiklik önermek için bir Pull Request açmaktan çekinmeyin.`

LlamaIndex içindeki gömme modeli, metnin sayısal temsillerini oluşturmakla sorumludur. Varsayılan olarak, LlamaIndex, OpenAI'den `text-embedding-ada-002` modelini kullanır.

Bu, açıkça `ServiceContext` nesnesinde ayarlanabilir.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## API Referansı

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
