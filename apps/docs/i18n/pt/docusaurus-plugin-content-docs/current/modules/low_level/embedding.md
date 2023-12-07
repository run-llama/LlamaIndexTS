---
sidebar_position: 1
---

# Incorporação

`Esta documentação foi traduzida automaticamente e pode conter erros. Não hesite em abrir um Pull Request para sugerir alterações.`

O modelo de incorporação no LlamaIndex é responsável por criar representações numéricas de texto. Por padrão, o LlamaIndex usará o modelo `text-embedding-ada-002` da OpenAI.

Isso pode ser definido explicitamente no objeto `ServiceContext`.

```typescript
import { OpenAIEmbedding, serviceContextFromDefaults } from "llamaindex";

const openaiEmbeds = new OpenAIEmbedding();

const serviceContext = serviceContextFromDefaults({ embedModel: openaiEmbeds });
```

## Referência da API

- [OpenAIEmbedding](../../api/classes/OpenAIEmbedding.md)
- [ServiceContext](../../api/interfaces/ServiceContext.md)

"
