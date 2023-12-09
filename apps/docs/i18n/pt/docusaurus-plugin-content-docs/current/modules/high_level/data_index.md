---
sidebar_position: 2
---

# Índice

`Esta documentação foi traduzida automaticamente e pode conter erros. Não hesite em abrir um Pull Request para sugerir alterações.`

Um índice é o recipiente básico e a organização para seus dados. O LlamaIndex.TS suporta dois tipos de índices:

- `VectorStoreIndex` - enviará os principais `Node`s para o LLM ao gerar uma resposta. O valor padrão para os principais é 2.
- `SummaryIndex` - enviará todos os `Node`s no índice para o LLM a fim de gerar uma resposta.

```typescript
import { Document, VectorStoreIndex } from "llamaindex";

const document = new Document({ text: "teste" });

const index = await VectorStoreIndex.fromDocuments([document]);
```

## Referência da API

- [SummaryIndex](../../api/classes/SummaryIndex.md)
- [VectorStoreIndex](../../api/classes/VectorStoreIndex.md)
