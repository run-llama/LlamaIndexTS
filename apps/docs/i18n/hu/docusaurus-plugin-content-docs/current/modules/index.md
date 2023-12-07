# Alapmodulok

`Ezt a dokumentációt automatikusan fordították le, és tartalmazhat hibákat. Ne habozzon nyitni egy Pull Requestet a változtatások javasolására.`

A LlamaIndex.TS több alapmodult kínál, amelyeket magas szintű modulokra és alacsony szintű modulokra osztottunk fel, hogy gyorsan elkezdhessünk, és testreszabható kulcskomponenseket kaphassunk.

## Magas szintű modulok

- [**Dokumentum**](./high_level/documents_and_nodes.md): Egy dokumentum egy szöveges fájlt, PDF fájlt vagy más összefüggő adatot képvisel.

- [**Csomópont**](./high_level/documents_and_nodes.md): Az alapvető adatépítő blokk. Általában ezek a dokumentum részei, amelyek kezelhető darabokra vannak felosztva, és elég kicsiek ahhoz, hogy be lehessen táplálni egy beágyazási modellbe és az LLM-be.

- [**Olvasó/Betöltő**](./high_level/data_loader.md): Az olvasó vagy betöltő olyan elem, amely valós dokumentumot vesz át, és átalakítja egy dokumentum osztállyá, amelyet aztán használhatunk az Indexben és a lekérdezésekben. Jelenleg támogatjuk a sima szövegfájlokat és a PDF-eket, és sok más formátumot is tervezünk támogatni.

- [**Indexek**](./high_level/data_index.md): Az indexek tárolják a csomópontokat és ezek csomópontok beágyazásait.

- [**Lekérdezési motor**](./high_level/query_engine.md): A lekérdezési motorok generálják a lekérdezést, amit megadunk, és visszaadják az eredményt. A lekérdezési motorok általában egy előre elkészített promptot kombinálnak a kiválasztott csomópontokkal az Indexből, hogy az LLM-nek megfelelő kontextust adjanak a lekérdezés megválaszolásához.

- [**Csevegőmotor**](./high_level/chat_engine.md): A csevegőmotor segít abban, hogy egy csevegőrobotot hozz létre, amely az Indexekkel interakcióba lép.

## Alacsony szintű modul

- [**LLM**](./low_level/llm.md): Az LLM osztály egy egységes felületet nyújt egy nagy nyelvi modell szolgáltatóhoz, mint például az OpenAI GPT-4, az Anthropic Claude vagy a Meta LLaMA. Az osztályt leszármaztathatja, hogy saját nagy nyelvi modelljéhez csatlakoztatót írjon.

- [**Embedding**](./low_level/embedding.md): Az embedding egy lebegőpontos számok vektoraként van reprezentálva. Az OpenAI text-embedding-ada-002 az alapértelmezett embedding modellünk, és minden általa generált embedding 1536 lebegőpontos számból áll. Egy másik népszerű embedding modell a BERT, amely 768 lebegőpontos számot használ minden csomópont reprezentálásához. Több olyan segédprogramot biztosítunk, amelyek az embeddingekkel való munkához szükségesek, beleértve 3 hasonlósági számítási lehetőséget és Maximum Marginal Relevance-t.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): A szöveg felosztási stratégiák rendkívül fontosak az embedding keresés általános hatékonyságához. Jelenleg, bár van egy alapértelmezett stratégia, nincs egyetlen megoldás, amely minden esetben megfelelő lenne. A forrásdokumentumoktól függően különböző felosztási méreteket és stratégiákat szeretnél használni. Jelenleg támogatjuk a fix méretű felosztást, a fix méretű felosztást átfedő szakaszokkal, a mondatokra való felosztást és az bekezdésekre való felosztást. A szöveg felosztó eszközt a NodeParser használja, amikor a `Document`-eket `Node`-okra osztja.

- [**Retriever**](./low_level/retriever.md): A Retriever az, ami ténylegesen kiválasztja a Node-okat az indexből való visszakereséshez. Itt több vagy kevesebb Node-ot is visszakereshetsz lekérdezésenként, megváltoztathatod a hasonlósági függvényt, vagy létrehozhatsz saját retrievert az alkalmazásodban minden egyes egyedi felhasználási esethez. Például külön retrievert hozhatsz létre a kód tartalomhoz és a szöveges tartalomhoz.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): A ResponseSynthesizer felelős egy lekérdezési karakterlánc feldolgozásáért, és egy `Node` lista felhasználásával választ generál. Ez sokféle formában történhet, például az összes kontextuson való iterálással és egy válasz finomításával, vagy összefoglalók faépítésével és a gyökér összefoglaló visszaadásával.

- [**Storage**](./low_level/storage.md): Eljön az a pont, amikor az indexeket, az adatokat és a vektorokat tárolni szeretnéd, ahelyett, hogy minden alkalommal újra futtatnád az embedding modelleket. Az IndexStore, DocStore, VectorStore és KVStore absztrakciók lehetővé teszik ezt. Együttesen alkotják a StorageContext-ot. Jelenleg lehetővé tesszük az embeddingek fájlokban történő tárolását a fájlrendszerben (vagy egy virtuális memóriafájlrendszerben), de aktívan hozzáadunk integrációkat a Vektor Adatbázisokhoz is.
