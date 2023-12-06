---
sidebar_position: 4
---

# Contoh End-to-End

`Dokumentasi ini telah diterjemahkan secara otomatis dan mungkin mengandung kesalahan. Jangan ragu untuk membuka Pull Request untuk mengusulkan perubahan.`

Kami menyertakan beberapa contoh end-to-end menggunakan LlamaIndex.TS di repositori ini.

Lihat contoh-contoh di bawah ini atau coba dan lengkapi dalam beberapa menit dengan tutorial interaktif Github Codespace yang disediakan oleh Dev-Docs [di sini](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Chat Engine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Baca file dan berdiskusi tentangnya dengan LLM.

## [Indeks Vektor](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Buat indeks vektor dan lakukan kueri. Indeks vektor akan menggunakan embedding untuk mengambil node-node yang paling relevan sebanyak k teratas. Secara default, k teratas adalah 2.

## [Indeks Ringkasan](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Buat indeks daftar dan cari di dalamnya. Contoh ini juga menggunakan `LLMRetriever`, yang akan menggunakan LLM untuk memilih node terbaik yang akan digunakan saat menghasilkan jawaban.

## [Simpan / Muat Indeks](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Buat dan muat indeks vektor. Penyimpanan ke disk dalam LlamaIndex.TS terjadi secara otomatis setelah objek konteks penyimpanan dibuat.

"

## [Indeks Vektor yang Dikustomisasi](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Buat indeks vektor dan lakukan kueri, sambil mengonfigurasi `LLM`, `ServiceContext`, dan `similarity_top_k`.

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Buat OpenAI LLM dan langsung gunakan untuk chat.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Membuat Llama-2 LLM dan langsung menggunakannya untuk chat.

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Menggunakan `SubQuestionQueryEngine`, yang memecah kueri kompleks menjadi beberapa pertanyaan, dan kemudian menggabungkan respons dari semua sub-pertanyaan.

"

## [Modul Tingkat Rendah](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Contoh ini menggunakan beberapa komponen tingkat rendah, yang menghilangkan kebutuhan akan mesin kueri yang sebenarnya. Komponen-komponen ini dapat digunakan di mana saja, dalam aplikasi apa pun, atau disesuaikan dan disubkelasikan untuk memenuhi kebutuhan Anda sendiri.

"
