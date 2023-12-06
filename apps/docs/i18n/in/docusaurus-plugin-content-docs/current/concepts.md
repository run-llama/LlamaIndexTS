---
sidebar_position: 3
---

# Konsep Tingkat Tinggi

`Dokumentasi ini telah diterjemahkan secara otomatis dan mungkin mengandung kesalahan. Jangan ragu untuk membuka Pull Request untuk mengusulkan perubahan.`

LlamaIndex.TS membantu Anda membangun aplikasi yang didukung oleh LLM (misalnya Q&A, chatbot) dengan menggunakan data kustom.

Dalam panduan konsep tingkat tinggi ini, Anda akan belajar:

- bagaimana LLM dapat menjawab pertanyaan menggunakan data Anda sendiri.
- konsep-konsep kunci dan modul dalam LlamaIndex.TS untuk menyusun pipeline query Anda sendiri.

## Menjawab Pertanyaan di Seluruh Data Anda

LlamaIndex menggunakan metode dua tahap saat menggunakan LLM dengan data Anda:

1. **tahap indexing**: mempersiapkan basis pengetahuan, dan
2. **tahap querying**: mengambil konteks relevan dari pengetahuan untuk membantu LLM dalam merespons pertanyaan

![](./_static/concepts/rag.jpg)

Proses ini juga dikenal sebagai Retrieval Augmented Generation (RAG).

LlamaIndex.TS menyediakan toolkit penting untuk membuat kedua tahap ini menjadi sangat mudah.

Mari kita jelajahi setiap tahap secara detail.

### Tahap Pengindeksan

LlamaIndex.TS membantu Anda mempersiapkan basis pengetahuan dengan rangkaian konektor data dan indeks.

![](./_static/concepts/indexing.jpg)

[**Data Loader**](./modules/high_level/data_loader.md):
Sebuah konektor data (yaitu `Reader`) mengambil data dari berbagai sumber data dan format data ke dalam representasi `Document` yang sederhana (teks dan metadata sederhana).

[**Dokumen / Node**](./modules/high_level/documents_and_nodes.md): Sebuah `Document` adalah wadah generik untuk setiap sumber data - misalnya, PDF, keluaran API, atau data yang diambil dari database. Sebuah `Node` adalah unit atomik data dalam LlamaIndex dan mewakili "chunk" dari `Document` sumber. Ini adalah representasi kaya yang mencakup metadata dan hubungan (ke node lain) untuk memungkinkan operasi pengambilan yang akurat dan ekspresif.

[**Indeks Data**](./modules/high_level/data_index.md):
Setelah Anda mengambil data Anda, LlamaIndex membantu Anda mengindeks data ke dalam format yang mudah diambil.

Di balik layar, LlamaIndex memparsing dokumen mentah menjadi representasi intermediate, menghitung vektor embedding, dan menyimpan data Anda di memori atau ke disk.

"

### Tahap Querying

Pada tahap querying, pipeline query mengambil konteks yang paling relevan berdasarkan pertanyaan pengguna,
dan meneruskannya ke LLM (bersama dengan pertanyaan) untuk mensintesis respons.

Ini memberikan LLM pengetahuan terkini yang tidak ada dalam data pelatihan aslinya,
(juga mengurangi halusinasi).

Tantangan utama pada tahap querying adalah pengambilan, orkestrasi, dan penalaran atas basis pengetahuan (mungkin banyak).

LlamaIndex menyediakan modul-modul yang dapat disusun yang membantu Anda membangun dan mengintegrasikan pipeline RAG untuk Q&A (query engine), chatbot (chat engine), atau sebagai bagian dari agen.

Blok-blok bangunan ini dapat disesuaikan untuk mencerminkan preferensi peringkat, serta disusun untuk melakukan penalaran atas beberapa basis pengetahuan secara terstruktur.

![](./_static/concepts/querying.jpg)

#### Blok Bangunan

[**Retrievers**](./modules/low_level/retriever.md):
Sebuah retriever mendefinisikan bagaimana mengambil konteks yang relevan secara efisien dari basis pengetahuan (yaitu indeks) ketika diberikan sebuah query.
Logika pengambilan spesifik berbeda untuk setiap indeks, yang paling populer adalah pengambilan padat terhadap indeks vektor.

[**Response Synthesizers**](./modules/low_level/response_synthesizer.md):
Sebuah response synthesizer menghasilkan respons dari LLM, menggunakan query pengguna dan kumpulan teks yang diambil.

"

#### Pipeline

[**Query Engines**](./modules/high_level/query_engine.md):
Query engine adalah pipeline end-to-end yang memungkinkan Anda untuk mengajukan pertanyaan tentang data Anda.
Ia menerima pertanyaan dalam bahasa alami, dan mengembalikan respons, bersama dengan konteks referensi yang diambil dan diteruskan ke LLM.

[**Chat Engines**](./modules/high_level/chat_engine.md):
Chat engine adalah pipeline end-to-end untuk melakukan percakapan dengan data Anda
(bukan hanya satu pertanyaan dan jawaban, tetapi berulang kali).

"
