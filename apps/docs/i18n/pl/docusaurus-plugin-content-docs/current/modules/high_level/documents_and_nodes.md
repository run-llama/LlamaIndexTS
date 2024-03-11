---
sidebar_position: 0
---

# Dokumenty i Węzły

`Ta dokumentacja została przetłumaczona automatycznie i może zawierać błędy. Nie wahaj się otworzyć Pull Request, aby zaproponować zmiany.`

`Dokumenty` i `Węzły` są podstawowymi elementami budowy każdego indeksu. Podczas gdy API dla tych obiektów jest podobne, obiekty `Dokument` reprezentują całe pliki, podczas gdy `Węzły` są mniejszymi fragmentami tego oryginalnego dokumentu, które są odpowiednie dla LLM i Q&A.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "tekst", metadata: { klucz: "wartość" } });
```

## Dokumentacja API

- [Dokument](../../api/classes/Document.md)
- [WęzełTekstowy](../../api/classes/TextNode.md)

"
