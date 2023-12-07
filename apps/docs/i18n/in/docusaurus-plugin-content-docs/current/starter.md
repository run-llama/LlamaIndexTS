---
sidebar_position: 2
---

# Panduan Pemula

`Dokumentasi ini telah diterjemahkan secara otomatis dan mungkin mengandung kesalahan. Jangan ragu untuk membuka Pull Request untuk mengusulkan perubahan.`

Setelah Anda [menginstal LlamaIndex.TS menggunakan NPM](installation) dan mengatur kunci OpenAI Anda, Anda siap untuk memulai aplikasi pertama Anda:

Di dalam folder baru:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # jika diperlukan
```

Buat file `example.ts`. Kode ini akan memuat beberapa data contoh, membuat dokumen, mengindeksnya (yang menciptakan embedding menggunakan OpenAI), dan kemudian membuat mesin kueri untuk menjawab pertanyaan tentang data tersebut.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Memuat esai dari abramov.txt di Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Membuat objek Dokumen dengan esai
  const document = new Document({ text: essay });

  // Memisahkan teks dan membuat embedding. Menyimpannya dalam VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Mengkueri indeks
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query(
    "Apa yang dilakukan penulis di perguruan tinggi?",
  );

  // Menampilkan respons
  console.log(response.toString());
}

main();
```

Kemudian Anda dapat menjalankannya menggunakan

```bash
npx ts-node example.ts
```

Siap untuk belajar lebih lanjut? Lihat playground NextJS kami di https://llama-playground.vercel.app/. Sumbernya tersedia di https://github.com/run-llama/ts-playground

"
