---
sidebar_position: 1
---

# Inbäddning

`Denna dokumentation har översatts automatiskt och kan innehålla fel. Tveka inte att öppna en Pull Request för att föreslå ändringar.`

Inbäddningsmodellen i LlamaIndex är ansvarig för att skapa numeriska representationer av text. Som standard kommer LlamaIndex att använda modellen `text-embedding-ada-002` från OpenAI.

Detta kan explicit ställas in i objektet `ServiceContext`.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## API-referens

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
