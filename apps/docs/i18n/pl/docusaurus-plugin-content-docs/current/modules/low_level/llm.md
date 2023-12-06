---
sidebar_position: 0
---

# LLM

`Ta dokumentacja została przetłumaczona automatycznie i może zawierać błędy. Nie wahaj się otworzyć Pull Request, aby zaproponować zmiany.`

LLM jest odpowiedzialny za odczytywanie tekstu i generowanie naturalnych odpowiedzi językowych na zapytania. Domyślnie LlamaIndex.TS używa `gpt-3.5-turbo`.

LLM można jawnie ustawić w obiekcie `ServiceContext`.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## Dokumentacja interfejsu API

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
