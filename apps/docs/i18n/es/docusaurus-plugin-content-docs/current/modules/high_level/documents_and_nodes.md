---
sidebar_position: 0
---

# Documentos y Nodos

`Esta documentación ha sido traducida automáticamente y puede contener errores. No dudes en abrir una Pull Request para sugerir cambios.`

Los `Documentos` y los `Nodos` son los bloques de construcción básicos de cualquier índice. Si bien la API para estos objetos es similar, los objetos `Documentos` representan archivos completos, mientras que los `Nodos` son fragmentos más pequeños de ese documento original, adecuados para un LLM y Q&A.

```typescript
import { Documento } from "llamaindex";

documento = new Documento({ texto: "texto", metadatos: { clave: "valor" } });
```

## Referencia de la API

- [Documento](../../api/classes/Documento.md)
- [NodoTexto](../../api/classes/NodoTexto.md)

"
