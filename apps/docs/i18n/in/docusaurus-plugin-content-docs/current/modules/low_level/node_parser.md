---
sidebar_position: 3
---

# NodeParser

`Dokumentasi ini telah diterjemahkan secara otomatis dan mungkin mengandung kesalahan. Jangan ragu untuk membuka Pull Request untuk mengusulkan perubahan.`

`NodeParser` dalam LlamaIndex bertanggung jawab untuk membagi objek `Document` menjadi objek `Node` yang lebih mudah dikelola. Ketika Anda memanggil `.fromDocuments()`, `NodeParser` dari `ServiceContext` digunakan untuk melakukan ini secara otomatis untuk Anda. Atau, Anda dapat menggunakannya untuk membagi dokumen sebelum waktunya.

```typescript
import { Document, SimpleNodeParser } from "llamaindex";

const nodeParser = new SimpleNodeParser();
const nodes = nodeParser.getNodesFromDocuments([
  new Document({ text: "Saya berusia 10 tahun. John berusia 20 tahun." }),
]);
```

## TextSplitter

Pemisah teks yang mendasarinya akan membagi teks berdasarkan kalimat. Ini juga dapat digunakan sebagai modul mandiri untuk membagi teks mentah.

```typescript
import { SentenceSplitter } from "llamaindex";

const splitter = new SentenceSplitter({ chunkSize: 1 });

const textSplits = splitter.splitText("Halo Dunia");
```

## Referensi API

- [SimpleNodeParser](../../api/classes/SimpleNodeParser.md)
- [SentenceSplitter](../../api/classes/SentenceSplitter.md)

"
