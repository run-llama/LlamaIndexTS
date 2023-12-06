---
sidebar_position: 1
---

# Вграждане (Embedding)

`Тази документация е преведена автоматично и може да съдържа грешки. Не се колебайте да отворите Pull Request, за да предложите промени.`

Моделът за вграждане в LlamaIndex е отговорен за създаването на числови представяния на текст. По подразбиране, LlamaIndex използва модела `text-embedding-ada-002` от OpenAI.

Това може да бъде явно зададено в обекта `ServiceContext`.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## API Референция

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
