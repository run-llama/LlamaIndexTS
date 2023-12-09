---
sidebar_position: 0
---

# Dokument och Noder

`Denna dokumentation har översatts automatiskt och kan innehålla fel. Tveka inte att öppna en Pull Request för att föreslå ändringar.`

`Dokument` och `Noder` är de grundläggande byggstenarna i en index. Även om API:et för dessa objekt är liknande, representerar `Dokument` objekt hela filer, medan `Noder` är mindre delar av det ursprungliga dokumentet, som är lämpliga för en LLM och Q&A.

```typescript
import { Document } from "llamaindex";

document = new Document({ text: "text", metadata: { key: "val" } });
```

## API Referens

- [Dokument](../../api/classes/Document.md)
- [TextNode](../../api/classes/TextNode.md)

"
