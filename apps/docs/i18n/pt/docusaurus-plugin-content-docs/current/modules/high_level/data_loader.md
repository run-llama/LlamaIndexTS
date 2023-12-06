---
sidebar_position: 1
---

`Esta documentação foi traduzida automaticamente e pode conter erros. Não hesite em abrir um Pull Request para sugerir alterações.`

# Leitor / Carregador

O LlamaIndex.TS suporta o carregamento fácil de arquivos de pastas usando a classe `SimpleDirectoryReader`. Atualmente, os arquivos `.txt`, `.pdf`, `.csv`, `.md` e `.docx` são suportados, com mais opções planejadas para o futuro!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## Referência da API

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)
