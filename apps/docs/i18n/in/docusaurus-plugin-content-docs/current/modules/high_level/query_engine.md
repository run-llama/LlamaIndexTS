---
sidebar_position: 3
---

# QueryEngine

`Dokumentasi ini telah diterjemahkan secara otomatis dan mungkin mengandung kesalahan. Jangan ragu untuk membuka Pull Request untuk mengusulkan perubahan.`

Query engine adalah sebuah mesin query yang menggabungkan `Retriever` dan `ResponseSynthesizer` menjadi sebuah pipeline, yang akan menggunakan string query untuk mengambil node dan kemudian mengirimnya ke LLM untuk menghasilkan respons.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("string query");
```

## Sub Question Query Engine

Konsep dasar dari Sub Question Query Engine adalah membagi sebuah query tunggal menjadi beberapa query, mendapatkan jawaban untuk setiap query tersebut, dan kemudian menggabungkan jawaban-jawaban yang berbeda tersebut menjadi sebuah respons tunggal yang koheren untuk pengguna. Anda dapat menganggapnya sebagai teknik "pikirkan ini langkah demi langkah" namun dengan mengiterasi sumber data Anda!

### Memulai

Cara termudah untuk mencoba Sub Question Query Engine adalah dengan menjalankan file subquestion.ts di [contoh](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

### Tools

SubQuestionQueryEngine diimplementasikan dengan menggunakan Tools. Ide dasar dari Tools adalah bahwa mereka adalah opsi yang dapat dieksekusi oleh large language model. Dalam kasus ini, SubQuestionQueryEngine kita bergantung pada QueryEngineTool, yang seperti yang Anda duga adalah sebuah tool untuk menjalankan query pada QueryEngine. Hal ini memungkinkan kita memberikan model opsi untuk melakukan query pada dokumen-dokumen yang berbeda misalnya. Anda juga dapat membayangkan bahwa SubQuestionQueryEngine dapat menggunakan Tool yang mencari sesuatu di web atau mendapatkan jawaban menggunakan Wolfram Alpha.

Anda dapat mempelajari lebih lanjut tentang Tools dengan melihat dokumentasi Python LlamaIndex di https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

"

## Referensi API

- [RetrieverQueryEngine](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool](../../api/interfaces/QueryEngineTool.md)
