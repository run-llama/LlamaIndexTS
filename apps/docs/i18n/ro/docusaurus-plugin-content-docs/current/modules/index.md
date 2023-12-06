# Module de bază

`Această documentație a fost tradusă automat și poate conține erori. Nu ezitați să deschideți un Pull Request pentru a sugera modificări.`

LlamaIndex.TS oferă mai multe module de bază, separate în module de nivel înalt pentru a începe rapid și module de nivel scăzut pentru a personaliza componentele cheie după nevoie.

## Module de nivel înalt

- [**Document**](./high_level/documents_and_nodes.md): Un document reprezintă un fișier text, un fișier PDF sau o altă bucată continuă de date.

- [**Node**](./high_level/documents_and_nodes.md): Blocul de construcție de bază al datelor. Cel mai frecvent, acestea sunt părți ale documentului împărțite în bucăți gestionabile, suficient de mici pentru a fi introduse într-un model de încorporare și LLM.

- [**Reader/Loader**](./high_level/data_loader.md): Un cititor sau încărcător este ceva care preia un document din lumea reală și îl transformă într-o clasă Document care poate fi apoi utilizată în indexul și interogările dvs. În prezent, suportăm fișiere de text simplu și fișiere PDF, cu multe altele în viitor.

- [**Indexes**](./high_level/data_index.md): indexele stochează nodurile și încorporările acestor noduri.

- [**QueryEngine**](./high_level/query_engine.md): Motoarele de interogare sunt cele care generează interogarea pe care o introduceți și vă oferă rezultatul înapoi. Motoarele de interogare combină în general o sugestie pre-construită cu nodurile selectate din indexul dvs. pentru a oferi LLM contextul de care are nevoie pentru a răspunde la interogarea dvs.

- [**ChatEngine**](./high_level/chat_engine.md): Un ChatEngine vă ajută să construiți un chatbot care va interacționa cu indexurile dvs.

## Modul de nivel scăzut

- [**LLM**](./low_level/llm.md): Clasa LLM este o interfață unificată peste un furnizor de modele de limbaj mare, cum ar fi OpenAI GPT-4, Anthropic Claude sau Meta LLaMA. Puteți crea o clasă derivată pentru a crea un conector către propriul dvs. model de limbaj mare.

- [**Embedding**](./low_level/embedding.md): Un embedding este reprezentat ca un vector de numere reale. Modelul nostru implicit de embedding este text-embedding-ada-002 de la OpenAI și fiecare embedding generat constă în 1.536 de numere reale. Un alt model popular de embedding este BERT, care utilizează 768 de numere reale pentru a reprezenta fiecare nod. Oferim o serie de utilități pentru a lucra cu embeddings, inclusiv 3 opțiuni de calcul al similarității și Maximum Marginal Relevance.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): Strategiile de împărțire a textului sunt extrem de importante pentru eficacitatea generală a căutării în embedding. În prezent, deși avem o valoare implicită, nu există o soluție care să se potrivească tuturor. În funcție de documentele sursă, este posibil să doriți să utilizați dimensiuni și strategii diferite de împărțire. În prezent, suportăm împărțirea după dimensiune fixă, împărțirea după dimensiune fixă cu secțiuni suprapuse, împărțirea după propoziție și împărțirea după paragraf. TextSplitter este utilizat de NodeParser pentru a împărți `Documente` în `Noduri`.

- [**Retriever**](./low_level/retriever.md): Retriever-ul este cel care selectează efectiv Nodurile de recuperat din index. Aici, puteți încerca să recuperați mai multe sau mai puține Noduri per interogare, să schimbați funcția de similaritate sau să creați propriul dvs. retriever pentru fiecare caz de utilizare individual în aplicația dvs. De exemplu, puteți dori să aveți un retriever separat pentru conținutul codului vs. conținutul text.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): ResponseSynthesizer-ul este responsabil pentru preluarea unui șir de interogare și utilizarea unei liste de `Noduri` pentru a genera un răspuns. Acest lucru poate lua mai multe forme, cum ar fi iterarea peste tot contextul și rafinarea unui răspuns sau construirea unui arbore de rezumate și returnarea rezumatului principal.

- [**Storage**](./low_level/storage.md): La un moment dat, veți dori să stocați indexurile, datele și vectorii în loc să rulați modelele de embedding de fiecare dată. IndexStore, DocStore, VectorStore și KVStore sunt abstracții care vă permit să faceți acest lucru. Împreună, ele formează StorageContext-ul. În prezent, vă permitem să persistați embeddings în fișiere pe sistemul de fișiere (sau într-un sistem de fișiere virtual în memorie), dar adăugăm și integrări active la bazele de date vectoriale.
