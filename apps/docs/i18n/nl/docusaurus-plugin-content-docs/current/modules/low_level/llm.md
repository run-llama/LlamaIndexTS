---
sidebar_position: 0
---

# LLM

`Deze documentatie is automatisch vertaald en kan fouten bevatten. Aarzel niet om een Pull Request te openen om wijzigingen voor te stellen.`

De LLM is verantwoordelijk voor het lezen van tekst en het genereren van natuurlijke taalreacties op vragen. Standaard maakt LlamaIndex.TS gebruik van `gpt-3.5-turbo`.

De LLM kan expliciet worden ingesteld in het `ServiceContext` object.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## API Referentie

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
