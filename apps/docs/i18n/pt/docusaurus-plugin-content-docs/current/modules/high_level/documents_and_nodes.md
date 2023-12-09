---
sidebar_position: 0
---

# Documentos e Nós

`Esta documentação foi traduzida automaticamente e pode conter erros. Não hesite em abrir um Pull Request para sugerir alterações.`

`Documentos` e `Nós` são os blocos de construção básicos de qualquer índice. Embora a API para esses objetos seja semelhante, os objetos `Documentos` representam arquivos inteiros, enquanto os `Nós` são partes menores desse documento original, adequados para um LLM e Q&A.

```typescript
import { Documento } from "llamaindex";

documento = new Documento({ texto: "texto", metadados: { chave: "val" } });
```

## Referência da API

- [Documento](../../api/classes/Documento.md)
- [Nó de Texto](../../api/classes/NoDeTexto.md)

"
