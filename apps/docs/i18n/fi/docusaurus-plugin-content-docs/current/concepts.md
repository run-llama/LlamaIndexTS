---
sidebar_position: 3
---

# Korkean tason käsitteet

`Tämä dokumentaatio on käännetty automaattisesti ja se saattaa sisältää virheitä. Älä epäröi avata Pull Requestia ehdottaaksesi muutoksia.`

LlamaIndex.TS auttaa sinua rakentamaan LLM-teknologiaa hyödyntäviä sovelluksia (esim. kysymys-vastaus, chatbotti) omien tietojen päälle.

Tässä korkean tason käsitteiden oppaassa opit:

- miten LLM voi vastata kysymyksiin omien tietojen avulla.
- keskeiset käsitteet ja moduulit LlamaIndex.TS:ssä oman kyselyputken luomiseen.

## Kysymysten vastaaminen tietokannassasi

LlamaIndex käyttää kahta vaihetta LLM:n käyttämisessä tietojesi kanssa:

1. **indeksointivaihe**: tietokannan valmistelu, ja
2. **kyselyvaihe**: relevantin kontekstin noutaminen tiedoista auttamaan LLM:ää vastaamaan kysymykseen

![](./_static/concepts/rag.jpg)

Tätä prosessia kutsutaan myös nimellä Retrieval Augmented Generation (RAG).

LlamaIndex.TS tarjoaa olennaisen työkalupakin, joka tekee molemmat vaiheet erittäin helpoiksi.

Tutkitaan jokaista vaihetta tarkemmin.

### Indeksointivaihe

LlamaIndex.TS auttaa sinua valmistelemaan tiedon perustan käyttämällä erilaisia tietoliittymiä ja indeksejä.

![](./_static/concepts/indexing.jpg)

[**Tietokuormaajat**](./modules/high_level/data_loader.md):
Tietoliitin (eli `Reader`) ottaa vastaan tietoa eri tietolähteistä ja tietomuodoista yksinkertaiseen `Document`-esitykseen (teksti ja yksinkertainen metatieto).

[**Dokumentit / Solmut**](./modules/high_level/documents_and_nodes.md): `Document` on yleinen säiliö minkä tahansa tietolähteen ympärillä - esimerkiksi PDF, API:n tuotos tai haettu tieto tietokannasta. `Node` on LlamaIndexin atomiyksikkö ja edustaa "pala" lähteen `Document`-tiedosta. Se on rikas esitys, joka sisältää metatiedon ja suhteet (muihin solmuihin), jotta tarkat ja ilmaisuvoimaiset noutotoiminnot ovat mahdollisia.

[**Tietoindeksit**](./modules/high_level/data_index.md):
Kun olet ottanut tietosi vastaan, LlamaIndex auttaa sinua indeksoimaan tiedot helposti noudettavaan muotoon.

LlamaIndex jäsentelee raakadokumentit väliaikaisiin esityksiin, laskee vektoriembeddingit ja tallentaa tietosi muistiin tai levylle.

"

### Kyselyvaihe

Kyselyvaiheessa kyselyputki noutaa käyttäjän kysymykseen liittyvän relevantin kontekstin
ja välittää sen LLM:lle (yhdessä kyselyn kanssa) syntetisoimaan vastauksen.

Tämä antaa LLM:lle ajan tasalla olevaa tietoa, jota ei ole sen alkuperäisessä koulutusdatassa,
(vähentäen myös harha-aistimuksia).

Kyselyvaiheen keskeinen haaste on tiedon noutaminen, orkestrointi ja päättely (mahdollisesti useista) tietokannoista.

LlamaIndex tarjoaa yhdisteltäviä moduuleja, jotka auttavat sinua rakentamaan ja integroimaan RAG-kyselyputkia kysymys-vastaus (kyselymoottori), chatbotti (chatmoottori) tai osana agenttia.

Nämä rakennuspalikat voidaan räätälöidä heijastamaan arvojärjestystä sekä yhdistää päättelyyn useista tietokannoista rakenteellisella tavalla.

![](./_static/concepts/querying.jpg)

#### Rakennuspalikat

[**Noutajat**](./modules/low_level/retriever.md):
Noutaja määrittelee, miten relevantti konteksti noudetaan tehokkaasti tietokannasta (eli indeksistä) annetun kyselyn perusteella.
Tietynlainen noutologiikka vaihtelee eri indekseille, suosituimpana tiheä nouto vektori-indeksin avulla.

[**Vastauksen syntetisaattorit**](./modules/low_level/response_synthesizer.md):
Vastauksen syntetisaattori generoi vastauksen LLM:ltä käyttäen käyttäjän kyselyä ja annettua joukkoa noudettuja tekstipätkiä.

"

#### Putket

[**Kyselymoottorit**](./modules/high_level/query_engine.md):
Kyselymoottori on päästä päähän -putki, joka mahdollistaa kysymysten esittämisen tietokantaasi.
Se ottaa vastaan luonnollisen kielen kyselyn ja palauttaa vastauksen yhdessä noudetun viitekontekstin kanssa, joka välitetään LLM:lle.

[**Chatmoottorit**](./modules/high_level/chat_engine.md):
Chatmoottori on päästä päähän -putki, joka mahdollistaa keskustelun käymisen tietojesi kanssa
(useita vuoropuheluja yhden kysymyksen ja vastauksen sijaan).

"
