---
sidebar_position: 0
---

# LLM

`Denna dokumentation har översatts automatiskt och kan innehålla fel. Tveka inte att öppna en Pull Request för att föreslå ändringar.`

LLM är ansvarig för att läsa text och generera naturliga språksvar på frågor. Som standard använder LlamaIndex.TS `gpt-3.5-turbo`.

LLM kan explicit sättas i `ServiceContext`-objektet.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## API-referens

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
