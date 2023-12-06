# Pagrindiniai moduliai

`Ši dokumentacija buvo automatiškai išversta ir gali turėti klaidų. Nedvejodami atidarykite Pull Request, jei norite pasiūlyti pakeitimus.`

LlamaIndex.TS siūlo keletą pagrindinių modulių, kurie yra suskirstyti į aukšto lygio modulius, skirtus greitam pradėjimui, ir žemo lygio modulius, skirtus tinkinti pagrindinius komponentus pagal jūsų poreikius.

## Aukšto lygio moduliai

- [**Dokumentas**](./high_level/documents_and_nodes.md): Dokumentas atitinka tekstinį failą, PDF failą ar kitą nuoseklią duomenų dalį.

- [**Mazgas**](./high_level/documents_and_nodes.md): Pagrindinė duomenų statybinė blokėli. Dažniausiai tai yra dokumento dalys, suskaidytos į valdomas dalis, kurios yra pakankamai mažos, kad galėtų būti paduotos į įterpimo modelį ir LLM.

- [**Skaitytuvas/Įkėlėjas**](./high_level/data_loader.md): Skaitytuvas ar įkėlėjas yra kas nors, kas priima dokumentą realiame pasaulyje ir jį paverčia į dokumento klasę, kurią galima naudoti jūsų indekse ir užklausose. Šiuo metu palaikome paprastus teksto failus ir daugybę PDF failų.

- [**Indeksai**](./high_level/data_index.md): Indeksai saugo mazgus ir šių mazgų įterpimus.

- [**Užklausų variklis**](./high_level/query_engine.md): Užklausų varikliai yra tie, kurie generuoja užklausą, kurią įvedate, ir grąžina rezultatą. Užklausų varikliai paprastai sujungia iš anksto sukurtą užklausos šabloną su pasirinktais mazgais iš jūsų indekso, kad suteiktų LLM kontekstą, kuris reikalingas atsakyti į jūsų užklausą.

- [**Pokalbių variklis**](./high_level/chat_engine.md): Pokalbių variklis padeda jums sukurti pokalbių roboto, kuris sąveikauja su jūsų indeksais.

## Žemo lygio modulis

- [**LLM**](./low_level/llm.md): LLM klasė yra vieningas sąsajos taškas didelio kalbos modelio tiekėjui, tokiam kaip OpenAI GPT-4, Anthropic Claude ar Meta LLaMA. Ją galite paveldėti, kad sukurtumėte jungiklį savo pačių dideliam kalbos modeliui.

- [**Embedding**](./low_level/embedding.md): Įterpimas yra vaizduojamas kaip slankiojo kablelio skaičių vektorius. Mūsų numatytasis įterpimo modelis yra OpenAI teksto-įterpimo-ada-002, kurio kiekvienas įterpimas susideda iš 1 536 slankiojo kablelio skaičių. Kitas populiarus įterpimo modelis yra BERT, kuris naudoja 768 slankiojo kablelio skaičius, kad vaizduotų kiekvieną mazgą. Mes teikiame keletą įrankių, skirtų dirbti su įterpimais, įskaitant 3 panašumo skaičiavimo variantus ir maksimalią ribinę reikšmingumą.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): Teksto skaidymo strategijos yra labai svarbios bendrai įterpimo paieškos efektyvumui. Šiuo metu, nors turime numatytąjį variantą, nėra vieno dydžio sprendimo, tinkamo visiems atvejams. Priklausomai nuo šaltinio dokumentų, galite norėti naudoti skirtingus skaidymo dydžius ir strategijas. Šiuo metu palaikome skaidymą pagal fiksuotą dydį, skaidymą pagal fiksuotą dydį su persidengiančiais skyriais, skaidymą pagal sakinį ir skaidymą pagal pastraipą. Teksto skaidyklė naudojama NodeParser, kai skaidoma `Dokumentai` į `Mazgus`.

- [**Retriever**](./low_level/retriever.md): Atkūrėjas yra tas, kuris iš tikrųjų pasirenka mazgus, kuriuos atkurti iš indekso. Čia galite bandyti atkurti daugiau ar mažiau mazgų užklausai, keisti panašumo funkciją arba sukurti savo atkūrėją kiekvienam atskiram naudojimo atvejui jūsų programoje. Pavyzdžiui, galite norėti turėti atskirą atkūrėją kodo turiniui ir teksto turiniui.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): Atsakymo sintezatorius atsakingas už užklausos eilutės naudojimą ir naudojant `Mazgų` sąrašą generuoja atsakymą. Tai gali būti įvairių formų, pvz., peržiūrint visą kontekstą ir tobulinant atsakymą arba kuriant medį su santraukomis ir grąžinant pagrindinę santrauką.

- [**Storage**](./low_level/storage.md): Iš anksto ar vėliau norėsite saugoti savo indeksus, duomenis ir vektorius, o ne kiekvieną kartą paleisti įterpimo modelius. IndexStore, DocStore, VectorStore ir KVStore yra abstrakcijos, leidžiančios tai padaryti. Kartu jie sudaro StorageContext. Šiuo metu leidžiame jums išsaugoti savo įterpimus failuose failų sistemoje (arba virtualioje atmintinėje failų sistemoje), tačiau taip pat aktyviai įtraukiame integracijas su vektorinėmis duomenų bazėmis.
