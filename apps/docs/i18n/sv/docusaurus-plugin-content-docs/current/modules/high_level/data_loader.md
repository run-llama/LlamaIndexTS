---
sidebar_position: 1
---

`Denna dokumentation har översatts automatiskt och kan innehålla fel. Tveka inte att öppna en Pull Request för att föreslå ändringar.`

# Läsare / Laddare

LlamaIndex.TS stöder enkel inläsning av filer från mappar med hjälp av klassen `SimpleDirectoryReader`. För närvarande stöds filtyperna `.txt`, `.pdf`, `.csv`, `.md` och `.docx`, med fler planerade i framtiden!

```typescript
import { SimpleDirectoryReader } from "llamaindex";

documents = new SimpleDirectoryReader().loadData("./data");
```

## API Referens

- [SimpleDirectoryReader](../../api/classes/SimpleDirectoryReader.md)
