---
sidebar_position: 3
---

# Koncepti na visokom nivou

`Ova dokumentacija je automatski prevedena i može sadržati greške. Ne oklevajte da otvorite Pull Request za predlaganje izmena.`

LlamaIndex.TS vam pomaže da izgradite aplikacije sa LLM-om (npr. Q&A, chatbot) preko prilagođenih podataka.

U ovom vodiču za koncepte na visokom nivou, naučićete:

- kako LLM može odgovarati na pitanja koristeći vaše sopstvene podatke.
- ključne koncepte i module u LlamaIndex.TS za sastavljanje sopstvenog upita.

## Odgovaranje na pitanja preko vaših podataka

LlamaIndex koristi dvostepenu metodu prilikom korišćenja LLM-a sa vašim podacima:

1. **indeksiranje faze**: priprema baze znanja, i
2. **upitna faza**: dobijanje relevantnog konteksta iz znanja kako bi se pomoglo LLM-u u odgovoru na pitanje.

![](./_static/concepts/rag.jpg)

Ovaj proces se takođe naziva Retrieval Augmented Generation (RAG).

LlamaIndex.TS pruža osnovni alat za olakšavanje oba koraka.

Hajde da istražimo svaku fazu detaljnije.

### Faza indeksiranja

LlamaIndex.TS vam pomaže da pripremite bazu znanja uz pomoć skupa konektora za podatke i indeksa.

![](./_static/concepts/indexing.jpg)

[**Učitavači podataka**](./modules/high_level/data_loader.md):
Konektor za podatke (tj. `Reader`) unosi podatke iz različitih izvora podataka i formata podataka u jednostavno predstavljanje `Dokumenta` (tekst i jednostavne metapodatke).

[**Dokumenti / Čvorovi**](./modules/high_level/documents_and_nodes.md): `Dokument` je generički kontejner oko bilo kog izvora podataka - na primer, PDF, izlaz iz API-ja ili preuzeti podaci iz baze podataka. `Čvor` je atomična jedinica podataka u LlamaIndex-u i predstavlja "komadić" izvornog `Dokumenta`. To je bogato predstavljanje koje uključuje metapodatke i odnose (prema drugim čvorovima) kako bi omogućilo tačne i izražajne operacije pretraživanja.

[**Indeksi podataka**](./modules/high_level/data_index.md):
Kada ste uneli podatke, LlamaIndex vam pomaže da indeksirate podatke u format koji je lako povratiti.

Ispod haube, LlamaIndex parsira sirove dokumente u međureprezentacije, izračunava vektorske ugnežđenja i skladišti vaše podatke u memoriji ili na disku.

### Faza upita

U fazi upita, upitni tok podataka dobija najrelevantniji kontekst na osnovu korisničkog upita,
i prosleđuje ga LLM-u (zajedno sa upitom) kako bi sintetisao odgovor.

Ovo daje LLM-u ažurirano znanje koje nije u njegovim originalnim obučavajućim podacima,
(takođe smanjujući halucinacije).

Ključni izazov u fazi upita je dobijanje, orkestracija i zaključivanje nad (potencijalno mnogo) bazama znanja.

LlamaIndex pruža sastavljive module koji vam pomažu da izgradite i integrišete RAG tokove za Q&A (upitni motor), chatbot (chat motor), ili kao deo agenta.

Ovi građevinski blokovi mogu biti prilagođeni kako bi odražavali preferencije rangiranja, kao i sastavljeni kako bi zaključivali nad više baza znanja na strukturiran način.

![](./_static/concepts/querying.jpg)

#### Građevinski blokovi

[**Retrieveri**](./modules/low_level/retriever.md):
Retriever definiše kako efikasno dobiti relevantan kontekst iz baze znanja (tj. indeksa) na osnovu upita.
Specifična logika dobijanja se razlikuje za različite indekse, najpopularniji je gusti retrieval protiv vektorskog indeksa.

[**Sintetizatori odgovora**](./modules/low_level/response_synthesizer.md):
Sintetizator odgovora generiše odgovor iz LLM-a koristeći korisnički upit i dati skup dobijenih tekstualnih fragmenata.

"

#### Tokovi

[**Upitni motori**](./modules/high_level/query_engine.md):
Upitni motor je krajnji tok podataka koji vam omogućava postavljanje pitanja nad vašim podacima.
Prihvata prirodni jezik upita i vraća odgovor, zajedno sa referentnim kontekstom koji je dobijen i prosleđen LLM-u.

[**Chat motori**](./modules/high_level/chat_engine.md):
Chat motor je krajnji tok podataka za vođenje razgovora sa vašim podacima
(više puta unazad i unapred umesto jednog pitanja i odgovora).

"
