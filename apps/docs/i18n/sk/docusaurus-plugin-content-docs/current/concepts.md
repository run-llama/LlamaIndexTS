---
sidebar_position: 3
---

# Koncepti na visoki ravni

`Ta dokumentacija je bila samodejno prevedena in lahko vsebuje napake. Ne oklevajte odpreti Pull Request za predlaganje sprememb.`

LlamaIndex.TS vam pomaga graditi aplikacije, ki temeljijo na LLM (npr. vprašanja in odgovori, chatbot) nad prilagojenimi podatki.

V tej vodniku o konceptih na visoki ravni boste izvedeli:

- kako LLM lahko odgovarja na vprašanja s pomočjo vaših lastnih podatkov.
- ključne koncepte in module v LlamaIndex.TS za sestavljanje lastne poizvedovalne cevovodne arhitekture.

## Odgovarjanje na vprašanja preko vaših podatkov

LlamaIndex uporablja dvostopenjsko metodo pri uporabi LLM z vašimi podatki:

1. **indeksiranje**: priprava baze znanja, in
2. **poizvedovanje**: pridobivanje relevantnega konteksta iz znanja, da pomaga LLM pri odgovarjanju na vprašanje

![](./_static/concepts/rag.jpg)

Ta postopek je znan tudi kot Retrieval Augmented Generation (RAG).

LlamaIndex.TS zagotavlja bistvena orodja za enostavno izvajanje obeh korakov.

Poglejmo si vsako stopnjo podrobneje.

### Stopnja indeksiranja

LlamaIndex.TS vam pomaga pri pripravi baze znanja s pomočjo nabora povezovalnikov podatkov in indeksov.

![](./_static/concepts/indexing.jpg)

[**Povezovalniki podatkov**](./modules/high_level/data_loader.md):
Povezovalnik podatkov (tj. `Reader`) vnaša podatke iz različnih virov podatkov in oblik podatkov v preprosto predstavitev `Document` (besedilo in preprosti metapodatki).

[**Dokumenti / Vozišča**](./modules/high_level/documents_and_nodes.md): `Document` je splošen kontejner za katerikoli vir podatkov - na primer PDF, izhod API-ja ali pridobljeni podatki iz baze podatkov. `Node` je atomarna enota podatkov v LlamaIndex in predstavlja "kos" vira `Document`. Gre za bogato predstavitev, ki vključuje metapodatke in odnose (do drugih vozlišč), ki omogočajo natančne in izrazite operacije pridobivanja.

[**Indeksi podatkov**](./modules/high_level/data_index.md):
Ko ste vnesli svoje podatke, vam LlamaIndex pomaga pri indeksiranju podatkov v format, ki je enostaven za pridobivanje.

Pod pokrovom LlamaIndex razčleni surove dokumente v vmesne predstavitve, izračuna vektorske vložke in shrani vaše podatke v pomnilnik ali na disk.

"

### Stopnja poizvedovanja

Na stopnji poizvedovanja cevovod za poizvedovanje pridobi najbolj relevanten kontekst glede na uporabnikovo poizvedbo
in ga preda LLM (skupaj s poizvedbo), da sintetizira odgovor.

To zagotavlja LLM-ju posodobljeno znanje, ki ni v njegovih izvirnih podatkih za usposabljanje,
(prav tako zmanjšuje halucinacije).

Ključni izziv na stopnji poizvedovanja je pridobivanje, usklajevanje in sklepanje iz (potencialno mnogih) baz znanja.

LlamaIndex zagotavlja sestavljive module, ki vam pomagajo graditi in integrirati cevovodne arhitekture RAG za vprašanja in odgovore (poizvedovalni motor), chatbote (chatbot motor) ali kot del agenta.

Te gradnike je mogoče prilagoditi, da odražajo prednostne vrstni redi rangiranja, pa tudi sestaviti, da sklepajo iz več baz znanja na strukturiran način.

![](./_static/concepts/querying.jpg)

#### Gradniki

[**Pridobitelji**](./modules/low_level/retriever.md):
Pridobitelj določa, kako učinkovito pridobiti relevanten kontekst iz baze znanja (tj. indeksa), ko je podana poizvedba.
Posebna logika pridobivanja se razlikuje glede na različne indekse, najbolj priljubljeno pa je gosto pridobivanje z uporabo vektorskega indeksa.

[**Sintetizatorji odgovorov**](./modules/low_level/response_synthesizer.md):
Sintetizator odgovora ustvari odgovor iz LLM z uporabo uporabnikove poizvedbe in določenega nabora pridobljenih besedilnih kosov.

"

#### Cevovodi

[**Poizvedovalni motorji**](./modules/high_level/query_engine.md):
Poizvedovalni motor je celovit cevovod, ki vam omogoča postavljanje vprašanj glede na vaše podatke.
Sprejme naravnojezično poizvedbo in vrne odgovor skupaj z referenčnim kontekstom, ki je bil pridobljen in posredovan LLM-ju.

[**Chatbot motorji**](./modules/high_level/chat_engine.md):
Chatbot motor je celovit cevovod za pogovor z vašimi podatki
(večkratno povratno vprašanje in odgovor namesto enega samega vprašanja in odgovora).

"
