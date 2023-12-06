# Modul Inti

`Dokumentasi ini telah diterjemahkan secara otomatis dan mungkin mengandung kesalahan. Jangan ragu untuk membuka Pull Request untuk mengusulkan perubahan.`

LlamaIndex.TS menawarkan beberapa modul inti, yang terbagi menjadi modul tingkat tinggi untuk memulai dengan cepat, dan modul tingkat rendah untuk menyesuaikan komponen kunci sesuai kebutuhan Anda.

## Modul Tingkat Tinggi

- [**Dokumen**](./high_level/documents_and_nodes.md): Sebuah dokumen mewakili file teks, file PDF, atau potongan data yang berkelanjutan lainnya.

- [**Node**](./high_level/documents_and_nodes.md): Blok data dasar. Paling umum, ini adalah bagian dari dokumen yang dibagi menjadi bagian-bagian yang dapat dikelola yang cukup kecil untuk dimasukkan ke dalam model embedding dan LLM.

- [**Pembaca/Pemuat**](./high_level/data_loader.md): Sebuah pembaca atau pemuat adalah sesuatu yang mengambil dokumen di dunia nyata dan mengubahnya menjadi kelas Dokumen yang kemudian dapat digunakan dalam Indeks dan kueri Anda. Saat ini kami mendukung file teks biasa dan PDF dengan banyak fitur lain yang akan datang.

- [**Indeks**](./high_level/data_index.md): Indeks menyimpan Node dan embedding dari node-node tersebut.

- [**Mesin Kueri**](./high_level/query_engine.md): Mesin kueri adalah yang menghasilkan kueri yang Anda masukkan dan memberikan Anda hasilnya. Mesin kueri umumnya menggabungkan prompt yang telah dibangun sebelumnya dengan node-node yang dipilih dari Indeks Anda untuk memberikan konteks yang diperlukan oleh LLM untuk menjawab kueri Anda.

- [**Mesin Obrolan**](./high_level/chat_engine.md): Mesin Obrolan membantu Anda membangun chatbot yang akan berinteraksi dengan Indeks Anda.

## Modul Tingkat Rendah

- [**LLM**](./low_level/llm.md): Kelas LLM adalah antarmuka yang terpadu untuk penyedia model bahasa besar seperti OpenAI GPT-4, Anthropic Claude, atau Meta LLaMA. Anda dapat membuat subkelasnya untuk menulis konektor ke model bahasa besar Anda sendiri.

- [**Embedding**](./low_level/embedding.md): Embedding direpresentasikan sebagai vektor angka floating point. Model embedding default kami adalah text-embedding-ada-002 dari OpenAI dan setiap embedding yang dihasilkannya terdiri dari 1.536 angka floating point. Model embedding populer lainnya adalah BERT yang menggunakan 768 angka floating point untuk merepresentasikan setiap Node. Kami menyediakan beberapa utilitas untuk bekerja dengan embedding termasuk 3 opsi perhitungan kesamaan dan Maximum Marginal Relevance.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): Strategi pemisahan teks sangat penting untuk efektivitas pencarian embedding secara keseluruhan. Saat ini, meskipun kami memiliki default, tidak ada solusi yang cocok untuk semua kasus. Tergantung pada dokumen sumber, Anda mungkin ingin menggunakan ukuran dan strategi pemisahan yang berbeda. Saat ini kami mendukung pemisahan berdasarkan ukuran tetap, pemisahan berdasarkan ukuran tetap dengan bagian yang tumpang tindih, pemisahan berdasarkan kalimat, dan pemisahan berdasarkan paragraf. Text splitter digunakan oleh NodeParser saat memisahkan `Document` menjadi `Node`.

- [**Retriever**](./low_level/retriever.md): Retriever adalah yang sebenarnya memilih Node yang akan diambil dari indeks. Di sini, Anda mungkin ingin mencoba mengambil lebih banyak atau lebih sedikit Node per permintaan, mengubah fungsi kesamaan Anda, atau membuat retriever sendiri untuk setiap kasus penggunaan individu dalam aplikasi Anda. Misalnya, Anda mungkin ingin memiliki retriever terpisah untuk konten kode vs konten teks.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): ResponseSynthesizer bertanggung jawab untuk mengambil string permintaan, dan menggunakan daftar `Node` untuk menghasilkan respons. Ini dapat berupa berbagai bentuk, seperti mengulang semua konteks dan menyempurnakan jawaban, atau membangun pohon ringkasan dan mengembalikan ringkasan utama.

- [**Storage**](./low_level/storage.md): Pada suatu titik, Anda akan ingin menyimpan indeks, data, dan vektor Anda daripada menjalankan model embedding setiap kali. IndexStore, DocStore, VectorStore, dan KVStore adalah abstraksi yang memungkinkan Anda melakukannya. Digabungkan, mereka membentuk StorageContext. Saat ini, kami memungkinkan Anda menyimpan embedding Anda dalam file di sistem file (atau sistem file virtual di memori), tetapi kami juga sedang aktif menambahkan integrasi ke Vector Databases.
