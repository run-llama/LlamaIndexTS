---
sidebar_position: 0
---

# Documenti e Nodi

`Questa documentazione è stata tradotta automaticamente e può contenere errori. Non esitare ad aprire una Pull Request per suggerire modifiche.`

I `Documenti` e i `Nodi` sono i blocchi fondamentali di qualsiasi indice. Sebbene l'API per questi oggetti sia simile, gli oggetti `Documenti` rappresentano interi file, mentre i `Nodi` sono pezzi più piccoli di quel documento originale, adatti per un LLM e una Q&A.

```typescript
import { Documento } from "llamaindex";

documento = new Documento({ testo: "testo", metadati: { chiave: "valore" } });
```

## Riferimento API

- [Documento](../../api/classes/Documento.md)
- [NodoTesto](../../api/classes/NodoTesto.md)

"
