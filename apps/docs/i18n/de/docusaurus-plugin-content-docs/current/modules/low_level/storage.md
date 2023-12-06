---
sidebar_position: 7
---

# Speicherung

`Diese Dokumentation wurde automatisch übersetzt und kann Fehler enthalten. Zögern Sie nicht, einen Pull Request zu öffnen, um Änderungen vorzuschlagen.`

Die Speicherung in LlamaIndex.TS funktioniert automatisch, sobald Sie ein `StorageContext`-Objekt konfiguriert haben. Konfigurieren Sie einfach das `persistDir` und fügen Sie es einem Index hinzu.

Derzeit wird nur das Speichern und Laden von der Festplatte unterstützt, mit zukünftigen Integrationen geplant!

```typescript
import { Document, VectorStoreIndex, storageContextFromDefaults } from "./src";

const storageContext = await storageContextFromDefaults({
  persistDir: "./storage",
});

const document = new Document({ text: "Test Text" });
const index = await VectorStoreIndex.fromDocuments([document], {
  storageContext,
});
```

## API-Referenz

- [StorageContext](../../api/interfaces/StorageContext.md)

"
