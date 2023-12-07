---
sidebar_position: 7
---

# Armazenamento

`Esta documentação foi traduzida automaticamente e pode conter erros. Não hesite em abrir um Pull Request para sugerir alterações.`

O armazenamento no LlamaIndex.TS funciona automaticamente assim que você configurar um objeto `StorageContext`. Basta configurar o `persistDir` e anexá-lo a um índice.

No momento, apenas o salvamento e o carregamento do disco são suportados, com integrações futuras planejadas!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Texto de Teste" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## Referência da API

- [StorageContext](../../api/interfaces/StorageContext.md)

"
