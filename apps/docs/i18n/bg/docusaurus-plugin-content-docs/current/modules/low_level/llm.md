---
sidebar_position: 0
---

# LLM

`Тази документация е преведена автоматично и може да съдържа грешки. Не се колебайте да отворите Pull Request, за да предложите промени.`

LLM е отговорен за четене на текст и генериране на отговори на естествен език на заявки. По подразбиране, LlamaIndex.TS използва `gpt-3.5-turbo`.

LLM може да бъде явно зададен в обекта `ServiceContext`.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## API Референция

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
