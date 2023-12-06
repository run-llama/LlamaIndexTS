---
sidebar_position: 0
---

# LLM

`Esta documentação foi traduzida automaticamente e pode conter erros. Não hesite em abrir um Pull Request para sugerir alterações.`

O LLM é responsável por ler texto e gerar respostas em linguagem natural para consultas. Por padrão, o LlamaIndex.TS usa `gpt-3.5-turbo`.

O LLM pode ser definido explicitamente no objeto `ServiceContext`.

```typescript
import { OpenAI, serviceContextFromDefaults } from "llamaindex";

const openaiLLM = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0 });

const serviceContext = serviceContextFromDefaults({ llm: openaiLLM });
```

## Referência da API

- [OpenAI](../../api/classes/OpenAI.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
