---
sidebar_position: 1
---

# Vkládání

`Tato dokumentace byla automaticky přeložena a může obsahovat chyby. Neváhejte otevřít Pull Request pro navrhování změn.`

Model vkládání v LlamaIndexu je zodpovědný za vytváření číselných reprezentací textu. Ve výchozím nastavení LlamaIndex používá model `text-embedding-ada-002` od OpenAI.

Toto lze explicitně nastavit v objektu `ServiceContext`.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## API Reference

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
