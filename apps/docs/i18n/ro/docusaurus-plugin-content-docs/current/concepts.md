---
sidebar_position: 3
---

# Concepte de nivel înalt

`Această documentație a fost tradusă automat și poate conține erori. Nu ezitați să deschideți un Pull Request pentru a sugera modificări.`

LlamaIndex.TS vă ajută să construiți aplicații cu motor LLM (de exemplu, Q&A, chatbot) peste date personalizate.

În acest ghid de concepte de nivel înalt, veți învăța:

- cum poate un LLM să răspundă la întrebări folosind propriile date.
- concepte cheie și module în LlamaIndex.TS pentru a compune propriul pipeline de interogare.

## Răspunderea la întrebări în întregul set de date

LlamaIndex folosește o metodă în două etape atunci când folosește un LLM cu datele dvs.:

1. **etapa de indexare**: pregătirea unei baze de cunoștințe și
2. **etapa de interogare**: recuperarea contextului relevant din cunoștințele pentru a ajuta LLM să răspundă la o întrebare

![](./_static/concepts/rag.jpg)

Acest proces este cunoscut și sub numele de Generare cu Recuperare Îmbunătățită (RAG).

LlamaIndex.TS oferă setul de instrumente esențiale pentru a face ambele etape extrem de ușoare.

Să explorăm fiecare etapă în detaliu.

### Etapa de indexare

LlamaIndex.TS vă ajută să pregătiți baza de cunoștințe cu o suită de conectori de date și indexi.

![](./_static/concepts/indexing.jpg)

[**Încărcătoare de date**](./modules/high_level/data_loader.md):
Un conector de date (adică `Reader`) preia date din diferite surse de date și formate de date într-o reprezentare simplă a `Documentului` (text și metadate simple).

[**Documente / Noduri**](./modules/high_level/documents_and_nodes.md): Un `Document` este un container generic pentru orice sursă de date - de exemplu, un PDF, un rezultat API sau date recuperate dintr-o bază de date. Un `Nod` este unitatea atomică de date în LlamaIndex și reprezintă o "bucată" a unui `Document` sursă. Este o reprezentare bogată care include metadate și relații (cu alte noduri) pentru a permite operații precise și expresive de recuperare.

[**Indexuri de date**](./modules/high_level/data_index.md):
După ce ați preluat datele, LlamaIndex vă ajută să indexați datele într-un format ușor de recuperat.

În spatele scenei, LlamaIndex analizează documentele brute în reprezentări intermediare, calculează înglobări vectoriale și stochează datele în memorie sau pe disc.

"

### Etapa de interogare

În etapa de interogare, pipeline-ul de interogare recuperează contextul cel mai relevant dată fiind o interogare a utilizatorului,
și îl transmite LLM-ului (împreună cu interogarea) pentru a sintetiza un răspuns.

Acest lucru oferă LLM-ului cunoștințe actualizate care nu se află în datele sale de antrenament originale,
(reducând, de asemenea, halucinațiile).

Provocarea cheie în etapa de interogare este recuperarea, orchestrarea și raționamentul asupra bazelor de cunoștințe (potențial multe).

LlamaIndex oferă module componibile care vă ajută să construiți și să integrați pipeline-uri RAG pentru Q&A (motor de interogare), chatbot (motor de chat) sau ca parte a unui agent.

Aceste blocuri de construcție pot fi personalizate pentru a reflecta preferințele de clasificare, precum și compuse pentru a raționa asupra mai multor baze de cunoștințe într-un mod structurat.

![](./_static/concepts/querying.jpg)

#### Blocuri de construcție

[**Recuperatoare**](./modules/low_level/retriever.md):
Un recuperator definește modul de recuperare eficientă a contextului relevant dintr-o bază de cunoștințe (adică index) atunci când i se oferă o interogare.
Logica specifică de recuperare diferă pentru diferite indicii, cel mai popular fiind recuperarea densă într-un index vectorial.

[**Sintetizatoare de răspuns**](./modules/low_level/response_synthesizer.md):
Un sintetizator de răspuns generează un răspuns dintr-un LLM, folosind o interogare a utilizatorului și un set dat de fragmente de text recuperate.

"

#### Pipeline-uri

[**Motoare de interogare**](./modules/high_level/query_engine.md):
Un motor de interogare este un pipeline de la cap la coadă care vă permite să puneți întrebări despre datele dvs.
Primește o interogare în limbaj natural și returnează un răspuns, împreună cu contextul de referință recuperat și transmis LLM-ului.

[**Motoare de chat**](./modules/high_level/chat_engine.md):
Un motor de chat este un pipeline de la cap la coadă pentru a purta o conversație cu datele dvs.
(mai multe schimburi de mesaje în loc de o singură întrebare și răspuns).

"
