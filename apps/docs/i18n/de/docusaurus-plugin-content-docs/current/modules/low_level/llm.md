---
sidebar_position: 0
---

# LLM

`Diese Dokumentation wurde automatisch übersetzt und kann Fehler enthalten. Zögern Sie nicht, einen Pull Request zu öffnen, um Änderungen vorzuschlagen.`

Der LLM ist dafür verantwortlich, Texte zu lesen und natürliche Sprachantworten auf Anfragen zu generieren. Standardmäßig verwendet LlamaIndex.TS `gpt-3.5-turbo`.

Der LLM kann explizit im `ServiceContext`-Objekt festgelegt werden.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## API-Referenz

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
