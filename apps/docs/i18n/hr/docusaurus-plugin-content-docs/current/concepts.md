---
sidebar_position: 3
---

# Koncepti na visokoj razini

`Ova dokumentacija je automatski prevedena i može sadržavati greške. Ne ustručavajte se otvoriti Pull Request za predlaganje promjena.`

LlamaIndex.TS vam pomaže izgraditi aplikacije s podrškom za LLM (npr. pitanja i odgovori, chatbot) nad prilagođenim podacima.

U ovom vodiču o konceptima na visokoj razini, naučit ćete:

- kako LLM može odgovarati na pitanja koristeći vaše vlastite podatke.
- ključne koncepte i module u LlamaIndex.TS za sastavljanje vlastitog upitačkog sustava.

## Odgovaranje na pitanja na temelju vaših podataka

LlamaIndex koristi dvostupanjsku metodu prilikom korištenja LLM-a s vašim podacima:

1. **indeksiranje**: priprema baze znanja, i
2. **upit**: dohvaćanje relevantnog konteksta iz znanja kako bi se pomoglo LLM-u u odgovoru na pitanje

![](./_static/concepts/rag.jpg)

Ovaj proces također je poznat kao Retrieval Augmented Generation (RAG).

LlamaIndex.TS pruža osnovni alat za jednostavno izvođenje oba koraka.

Pogledajmo svaku fazu detaljnije.

### Faza indeksiranja

LlamaIndex.TS vam pomaže pripremiti bazu znanja uz pomoć skupa konektora podataka i indeksa.

![](./_static/concepts/indexing.jpg)

[**Učitavači podataka**](./modules/high_level/data_loader.md):
Konektor podataka (tj. `Reader`) učitava podatke iz različitih izvora podataka i formata podataka u jednostavno predstavljanje `Dokumenta` (tekst i jednostavne metapodatke).

[**Dokumenti / Čvorovi**](./modules/high_level/documents_and_nodes.md): `Dokument` je generički spremnik za bilo koji izvor podataka - na primjer, PDF, izlaz iz API-ja ili dohvaćeni podaci iz baze podataka. `Čvor` je atomična jedinica podataka u LlamaIndex i predstavlja "komadić" izvornog `Dokumenta`. To je bogato predstavljanje koje uključuje metapodatke i odnose (prema drugim čvorovima) kako bi omogućilo točne i izražajne operacije dohvaćanja.

[**Indeksi podataka**](./modules/high_level/data_index.md):
Nakon što ste učitali podatke, LlamaIndex vam pomaže indeksirati podatke u format koji je jednostavan za dohvaćanje.

Iza kulisa, LlamaIndex parsira sirove dokumente u međureprezentacije, izračunava vektorske ugrađaje i pohranjuje vaše podatke u memoriju ili na disk.

"

### Faza upita

U fazi upita, upitni sustav dohvaća najrelevantniji kontekst na temelju korisničkog upita,
i prosljeđuje ga LLM-u (uz upit) kako bi sintetizirao odgovor.

To pruža LLM-u ažurirano znanje koje nije uključeno u njegove izvorne podatke za obuku,
(također smanjujući halucinacije).

Ključni izazov u fazi upita je dohvaćanje, orkestracija i zaključivanje nad (potencijalno mnogim) bazama znanja.

LlamaIndex pruža sastavljive module koji vam pomažu izgraditi i integrirati RAG sustave za pitanja i odgovore (upitnički sustav), chatbotove (chat sustav) ili kao dio agenta.

Ovi građevni blokovi mogu se prilagoditi kako bi odražavali preferencije rangiranja, kao i sastavljati kako bi zaključivali nad više baza znanja na strukturiran način.

![](./_static/concepts/querying.jpg)

#### Građevni blokovi

[**Dohvatioci**](./modules/low_level/retriever.md):
Dohvatilac definira kako učinkovito dohvatiti relevantni kontekst iz baze znanja (tj. indeksa) kada je zadano upit.
Specifična logika dohvaćanja razlikuje se za različite indekse, najpopularniji je gusti dohvat protiv vektorskog indeksa.

[**Sintetizatori odgovora**](./modules/low_level/response_synthesizer.md):
Sintetizator odgovora generira odgovor iz LLM-a koristeći korisnički upit i zadani skup dohvaćenih tekstualnih fragmenata.

"

#### Sustavi

[**Upitnički sustavi**](./modules/high_level/query_engine.md):
Upitnički sustav je cjeloviti sustav koji vam omogućuje postavljanje pitanja nad vašim podacima.
Prihvaća prirodni jezik upita i vraća odgovor, zajedno s dohvaćenim referentnim kontekstom koji se prosljeđuje LLM-u.

[**Chat sustavi**](./modules/high_level/chat_engine.md):
Chat sustav je cjeloviti sustav za vođenje razgovora s vašim podacima
(više puta uzajamno umjesto jednog pitanja i odgovora).

"
