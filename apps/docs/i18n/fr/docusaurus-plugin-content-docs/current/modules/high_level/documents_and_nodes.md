---
sidebar_position: 0
---

# Documents et Noeuds

Les `Document`s et les `Node`s sont les éléments de base de tout index. Bien que l'API pour ces objets soit similaire, les objets `Document` représentent des fichiers entiers, tandis que les `Node`s sont des morceaux plus petits de ce document original, adaptés à un LLM et à une Q&R.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "texte", metadata: { clé: "val" } });
```

## Référence de l'API

- [Document](../../api/classes/Document)
- [TextNode](../../api/classes/TextNode)
