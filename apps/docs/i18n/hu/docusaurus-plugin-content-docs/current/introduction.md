---
sidebar_position: 0
slug: /
---

# Mi az LlamaIndex.TS?

`Ezt a dokumentációt automatikusan fordították le, és tartalmazhat hibákat. Ne habozzon nyitni egy Pull Requestet a változtatások javasolására.`

Az LlamaIndex.TS egy adatkeretrendszer az LLM alkalmazások számára, amely lehetővé teszi a privát vagy domain-specifikus adatok beolvasását, strukturálását és hozzáférését. Bár elérhető egy Python csomag is (lásd [itt](https://docs.llamaindex.ai/en/stable/)), az LlamaIndex.TS egyszerű csomagban kínálja a fő funkciókat, amelyeket a TypeScript használatára optimalizáltak.

## 🚀 Miért érdemes használni a LlamaIndex.TS-t?

Az LLM-ek lényegében természetes nyelvű felületet kínálnak az emberek és a következtetett adatok között. Széles körben elérhető modellek előre betanítottak hatalmas mennyiségű nyilvánosan elérhető adatra, a Wikipédiától és a levelezési listáktól a tankönyvekig és a forráskódig.

Az LLM-ekre épülő alkalmazások gyakran igénylik ezeknek a modelleknek a privát vagy domain-specifikus adatokkal való kiegészítését. Sajnos ezek az adatok szét vannak szórva az alkalmazások és adattárolók között. Az API-k mögött vannak, SQL adatbázisokban találhatók, vagy PDF-ekben és diavetítésekben rejtőznek.

Ebben segít a **LlamaIndex.TS**.

## 🦙 Hogyan segíthet a LlamaIndex.TS?

A LlamaIndex.TS az alábbi eszközöket biztosítja:

- **Adatbetöltés** - közvetlenül beolvashatja meglévő `.txt`, `.pdf`, `.csv`, `.md` és `.docx` adatait
- **Adatindexek** - strukturálja az adatait köztes reprezentációkba, amelyek könnyen és hatékonyan fogyaszthatók LLM-ekkel.
- **Motorok** - természetes nyelvű hozzáférést biztosítanak az adataihoz. Például:
  - A lekérdezési motorok erőteljes visszakeresési felületek a tudásbővített kimenet számára.
  - A csevegőmotorok konverzációs felületek a több üzenetes, "oda-vissza" interakciókhoz az adataival.

## 👨‍👩‍👧‍👦 Kinek való az LlamaIndex?

Az LlamaIndex.TS egy alapvető eszközkészletet nyújt, amely nélkülözhetetlen azoknak, akik JavaScript és TypeScript segítségével LLM alkalmazásokat építenek.

A magas szintű API lehetővé teszi a kezdő felhasználók számára, hogy az LlamaIndex.TS-t használják az adatok beolvasására és lekérdezésére.

A komplexebb alkalmazásokhoz a mélyebb szintű API-k lehetővé teszik a haladó felhasználók számára, hogy testre szabják és kibővítsék bármely modult - adatkonnektorokat, indexeket, visszakeresőket és lekérdezési motorokat - az igényeiknek megfelelően.

## Első lépések

`npm install llamaindex`

A dokumentációnk tartalmazza a [Telepítési utasításokat](./installation.md) és egy [Kezdő útmutatót](./starter.md) az első alkalmazás létrehozásához.

Miután elindultál, a [Magas szintű fogalmak](./concepts.md) áttekintést ad a LlamaIndex moduláris architektúrájáról. További gyakorlati példákért tekintsd meg az [End-to-End útmutatóinkat](./end_to_end.md).

## 🗺️ Ökoszisztéma

Az LlamaIndex letöltéséhez vagy hozzájárulásához keresd meg az alábbi helyeken:

- Github: https://github.com/run-llama/LlamaIndexTS
- NPM: https://www.npmjs.com/package/llamaindex

"

## Közösség

Segítségre van szüksége? Van egy funkció javaslata? Csatlakozzon az LlamaIndex közösséghez:

- Twitter: https://twitter.com/llama_index
- Discord: https://discord.gg/dGcwcsnxhU
