---
sidebar_position: 6
---

# ResponseSynthesizer

`Dokumentasi ini telah diterjemahkan secara otomatis dan mungkin mengandung kesalahan. Jangan ragu untuk membuka Pull Request untuk mengusulkan perubahan.`

ResponseSynthesizer bertanggung jawab untuk mengirimkan query, node, dan template prompt ke LLM untuk menghasilkan respons. Ada beberapa mode utama untuk menghasilkan respons:

- `Refine`: "membuat dan menyempurnakan" jawaban dengan secara berurutan melalui setiap potongan teks yang ditemukan. Ini membuat panggilan LLM terpisah per Node. Bagus untuk jawaban yang lebih rinci.
- `CompactAndRefine` (default): "mengompakkan" prompt selama setiap panggilan LLM dengan memasukkan sebanyak mungkin potongan teks yang dapat muat dalam ukuran prompt maksimum. Jika terlalu banyak potongan untuk dimasukkan dalam satu prompt, "membuat dan menyempurnakan" jawaban dengan melalui beberapa prompt yang kompak. Sama seperti `refine`, tetapi seharusnya menghasilkan panggilan LLM yang lebih sedikit.
- `TreeSummarize`: Diberikan sekumpulan potongan teks dan query, secara rekursif membangun pohon dan mengembalikan node root sebagai respons. Bagus untuk tujuan ringkasan.
- `SimpleResponseBuilder`: Diberikan sekumpulan potongan teks dan query, menerapkan query ke setiap potongan teks sambil mengumpulkan respons ke dalam sebuah array. Mengembalikan string yang digabungkan dari semua respons. Bagus ketika Anda perlu menjalankan query yang sama secara terpisah terhadap setiap potongan teks.

```typescript
import { NodeWithScore, ResponseSynthesizer, TextNode } from "llamaindex";

const responseSynthesizer = new ResponseSynthesizer();

const nodesWithScore: NodeWithScore[] = [
  {
    node: new TextNode({ text: "Saya berusia 10 tahun." }),
    score: 1,
  },
  {
    node: new TextNode({ text: "John berusia 20 tahun." }),
    score: 0.5,
  },
];

const response = await responseSynthesizer.synthesize(
  "Berapa usia saya?",
  nodesWithScore,
);
console.log(response.response);
```

## Referensi API

- [ResponseSynthesizer](../../api/classes/ResponseSynthesizer.md)
- [Refine](../../api/classes/Refine.md)
- [CompactAndRefine](../../api/classes/CompactAndRefine.md)
- [TreeSummarize](../../api/classes/TreeSummarize.md)
- [SimpleResponseBuilder](../../api/classes/SimpleResponseBuilder.md)

"
