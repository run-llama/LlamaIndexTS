---
sidebar_position: 3
---

# Magas szintű fogalmak

`Ezt a dokumentációt automatikusan fordították le, és tartalmazhat hibákat. Ne habozzon nyitni egy Pull Requestet a változtatások javasolására.`

A LlamaIndex.TS segít az LLM-alapú alkalmazások (pl. kérdés-válasz, chatbot) készítésében saját adatok felett.

Ebben a magas szintű fogalmak útmutatóban megtudhatja:

- hogyan válaszol egy LLM a saját adatai alapján feltett kérdésekre.
- a LlamaIndex.TS kulcsfontosságú fogalmait és moduljait, amelyek segítenek a saját lekérdezési csővezeték összeállításában.

## Kérdések megválaszolása az Ön adatai alapján

A LlamaIndex kétlépcsős módszert használ az LLM használatakor az adatokkal:

1. **indexelési szakasz**: egy tudásbázis előkészítése, és
2. **lekérdezési szakasz**: releváns kontextus visszanyerése a tudásból, hogy segítse az LLM-et a kérdésre adott válaszban

![](./_static/concepts/rag.jpg)

Ezt a folyamatot Retrieval Augmented Generation (RAG) néven is ismerik.

A LlamaIndex.TS biztosítja az alapvető eszközkészletet mindkét lépés egyszerűvé tételéhez.

Vizsgáljuk meg részletesen mindkét szakaszt.

### Indexelési szakasz

A LlamaIndex.TS segít az adatbázis előkészítésében adatkonnektorok és indexek segítségével.

![](./_static/concepts/indexing.jpg)

[**Adatbetöltők**](./modules/high_level/data_loader.md):
Egy adatkonnektor (pl. `Reader`) adatokat vesz fel különböző adatforrásokból és adatformátumokból egy egyszerű `Document` reprezentációba (szöveg és egyszerű metaadat).

[**Dokumentumok / Csomópontok**](./modules/high_level/documents_and_nodes.md): Egy `Document` egy általános tartály bármilyen adatforrás körül - például egy PDF, egy API kimenet vagy adatok lekérdezése az adatbázisból. Egy `Node` az adat atomi egysége a LlamaIndex-ben, és egy forrás `Document` "darabja". Ez egy gazdag reprezentáció, amely tartalmaz metaadatot és kapcsolatokat (más csomópontokhoz), hogy pontos és kifejező lekérdezési műveleteket lehessen végezni.

[**Adatindexek**](./modules/high_level/data_index.md):
Miután felvette az adatait, a LlamaIndex segít az adatok indexelésében egy olyan formátumba, amely könnyen visszanyerhető.

A LlamaIndex a háttérben feldolgozza a nyers dokumentumokat köztes reprezentációkká, kiszámítja a vektorbeágyazásokat, és az adatokat memóriában vagy lemezre tárolja.

"

### Lekérdezési szakasz

A lekérdezési szakaszban a lekérdezési csővezeték a legrelevánsabb kontextust nyeri ki egy felhasználói lekérdezés alapján,
és átadja azt az LLM-nek (a lekérdezéssel együtt) egy válasz szintetizálásához.

Ez az LLM-nek naprakész tudást biztosít, amely nincs benne eredeti képzési adataiban,
(csökkentve a hallucinációt is).

A lekérdezési szakasz legnagyobb kihívása a visszanyerés, az orkestrálás és a gondolkodás a (lehetőleg sok) tudásbázis felett.

A LlamaIndex biztosítja a komponálható modulokat, amelyek segítenek a RAG csővezetékek (lekérdezési motor), chatbot (chat motor) vagy egy ügynök részeként történő összeállításában.

Ezeket az építőköveket testreszabhatja a rangsorolási preferenciák tükrözésére, valamint strukturált módon történő gondolkodáshoz több tudásbázis felett.

![](./_static/concepts/querying.jpg)

#### Építőkövek

[**Visszakeresők**](./modules/low_level/retriever.md):
Egy visszakereső meghatározza, hogyan lehet hatékonyan visszakeresni a releváns kontextust egy tudásbázisból (azaz indexből) egy lekérdezés alapján.
A konkrét visszakeresési logika különbözik a különböző indexek esetén, a legnépszerűbb a sűrű visszakeresés egy vektor index ellen.

[**Válasz szintetizálók**](./modules/low_level/response_synthesizer.md):
Egy válasz szintetizáló választ generál egy LLM-ből, egy felhasználói lekérdezés és egy adott halmaz visszakerült szövegrészlet segítségével.

"

#### Csővezetékek

[**Lekérdezési motorok**](./modules/high_level/query_engine.md):
Egy lekérdezési motor egy végponti csővezeték, amely lehetővé teszi a kérdések feltevését az adatai alapján.
Egy természetes nyelvű lekérdezést vesz fel, és választ ad, valamint a hivatkozott kontextust átadja az LLM-nek.

[**Chat motorok**](./modules/high_level/chat_engine.md):
Egy chat motor egy végponti csővezeték adataival való párbeszéd folytatásához
(több oda-vissza helyett egyetlen kérdés és válasz).

"
