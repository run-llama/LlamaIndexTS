# Ydinmoduulit

`Tämä dokumentaatio on käännetty automaattisesti ja se saattaa sisältää virheitä. Älä epäröi avata Pull Requestia ehdottaaksesi muutoksia.`

LlamaIndex.TS tarjoaa useita ydinmoduuleja, jotka on jaettu korkean tason moduuleihin nopeaa aloittamista varten ja matalan tason moduuleihin, joiden avulla voit mukauttaa keskeisiä komponentteja tarpeidesi mukaan.

## Korkean tason moduulit

- [**Dokumentti**](./high_level/documents_and_nodes.md): Dokumentti edustaa teksti-, PDF- tai muuta jatkuvaa tietopläjäystä.

- [**Solmu**](./high_level/documents_and_nodes.md): Perusdatan rakennuspalikka. Yleensä nämä ovat dokumentin osia, jotka on jaettu hallittaviin palasiin, jotka ovat tarpeeksi pieniä syötettäväksi upotusmalliin ja LLM:ään.

- [**Lukija/Lataaja**](./high_level/data_loader.md): Lukija tai lataaja on jotain, joka ottaa vastaan dokumentin todellisessa maailmassa ja muuntaa sen Dokumentti-luokaksi, jota voidaan sitten käyttää indeksissäsi ja kyselyissäsi. Tällä hetkellä tuemme tavallisia tekstitiedostoja ja PDF-tiedostoja, ja tuemme tulevaisuudessa monia muita tiedostomuotoja.

- [**Indeksit**](./high_level/data_index.md): Indeksit tallentavat solmut ja niiden upotukset.

- [**Kyselymoottori**](./high_level/query_engine.md): Kyselymoottorit luovat kyselyn, jonka syötät ja antavat sinulle tuloksen. Kyselymoottorit yleensä yhdistävät valmiin vihjeen indeksistäsi valittujen solmujen kanssa antaakseen LLM:lle tarvittavan kontekstin vastataksesi kyselyysi.

- [**Keskustelumoottori**](./high_level/chat_engine.md): Keskustelumoottori auttaa sinua rakentamaan keskusteluavustajan, joka vuorovaikuttaa indeksiesi kanssa.

## Matalan tason moduuli

- [**LLM**](./low_level/llm.md): LLM-luokka on yhtenäinen rajapinta suuren kielioppimallin tarjoajalle, kuten OpenAI GPT-4, Anthropic Claude tai Meta LLaMA. Voit luoda siitä aliluokan ja kirjoittaa yhteyden oman suuren kielioppimallisi kanssa.

- [**Upotus**](./low_level/embedding.md): Upotus edustetaan liukulukujen vektorina. OpenAI:n tekstiupotus-ada-002 on oletusupotusmallimme, ja jokainen sen luoma upotus koostuu 1 536 liukuluvusta. Toinen suosittu upotusmalli on BERT, joka käyttää 768 liukulukua kunkin solmun edustamiseen. Tarjoamme useita työkaluja upotusten käsittelyyn, mukaan lukien 3 samankaltaisuuden laskentavaihtoehtoa ja maksimaalinen marginaalinen merkitys.

- [**Tekstin jakaja/NodeParser**](./low_level/node_parser.md): Tekstin jakamisstrategiat ovat äärimmäisen tärkeitä upotushakujen kokonaisvaikuttavuuden kannalta. Tällä hetkellä meillä on oletusarvo, mutta ei ole yhtä ratkaisua kaikille. Lähdetekstien perusteella saatat haluta käyttää erilaisia jakokokoja ja -strategioita. Tällä hetkellä tuemme kiinteän koon jakamista, kiinteän koon jakamista päällekkäisillä osilla, lauseen jakamista ja kappaleen jakamista. Tekstin jakaja käytetään NodeParserin avulla, kun jaetaan `Dokumentteja` `Solmuihin`.

- [**Hakija**](./low_level/retriever.md): Hakija valitsee todellisuudessa Solmut, jotka palautetaan indeksistä. Tässä voit haluta kokeilla enemmän tai vähemmän Solmuja kyselyä kohden, muuttaa samankaltaisuusfunktiota tai luoda oman hakijan jokaiseen yksittäiseen käyttötapaukseen sovelluksessasi. Esimerkiksi voit haluta erillisen hakijan koodisisällölle ja tekstisisällölle.

- [**Vastetekstin syntetisaattori**](./low_level/response_synthesizer.md): Vastetekstin syntetisaattori vastaa kyselymerkkijonon ottamisesta ja käyttää `Solmu`jen luetteloa vastauksen luomiseen. Tämä voi tapahtua monin tavoin, kuten kaikkien kontekstien läpikäynti ja vastauksen tarkentaminen tai tiivistelmien puun rakentaminen ja juuritiivistelmän palauttaminen.

- [**Säilytys**](./low_level/storage.md): Jossain vaiheessa haluat tallentaa indeksisi, tiedot ja vektorit sen sijaan, että suorittaisit upotusmallit joka kerta uudelleen. IndexStore, DocStore, VectorStore ja KVStore ovat abstraktioita, jotka mahdollistavat tämän. Yhdessä ne muodostavat StorageContextin. Tällä hetkellä voit tallentaa upotuksesi tiedostoihin tiedostojärjestelmään (tai virtuaaliseen muistitiedostojärjestelmään), mutta lisäämme myös aktiivisesti integraatioita vektoritietokantoihin.
