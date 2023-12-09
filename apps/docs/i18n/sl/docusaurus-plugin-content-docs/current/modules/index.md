# Hlavné moduly

`Táto dokumentácia bola automaticky preložená a môže obsahovať chyby. Neváhajte otvoriť Pull Request na navrhnutie zmien.`

LlamaIndex.TS ponúka niekoľko hlavných modulov, ktoré sú rozdelené na moduly vysokej úrovne pre rýchly štart a moduly nízkej úrovne pre prispôsobenie kľúčových komponentov podľa potreby.

## Vysokoúrovňové moduly

- [**Dokument**](./high_level/documents_and_nodes.md): Dokument predstavuje textový súbor, súbor PDF alebo iný súvislý údaj.

- [**Node**](./high_level/documents_and_nodes.md): Základná stavebná jednotka údajov. Najčastejšie ide o časti dokumentu rozdelené na spraviteľné kúsky, ktoré sú dostatočne malé na vloženie do modelu vloženia a LLM.

- [**Reader/Loader**](./high_level/data_loader.md): Čítač alebo načítavač je niečo, čo prijíma dokument zo skutočného sveta a transformuje ho do triedy Dokument, ktorá potom môže byť použitá vo vašom indexe a dotazoch. Momentálne podporujeme súbory s obyčajným textom a PDF súbory a v budúcnosti pridáme ešte mnoho ďalších formátov.

- [**Indexy**](./high_level/data_index.md): Indexy uchovávajú uzly a vloženia týchto uzlov.

- [**QueryEngine**](./high_level/query_engine.md): Dotazovacie motory generujú dotaz, ktorý zadáte, a vrátia vám výsledok. Dotazovacie motory zvyčajne kombinujú predpripravený vstup s vybranými uzlami z vášho indexu, aby poskytli LLM kontext, ktorý potrebuje na zodpovedanie vášho dotazu.

- [**ChatEngine**](./high_level/chat_engine.md): ChatEngine vám pomáha vytvoriť chatbota, ktorý bude interagovať s vašimi indexmi.

## Modul nízkej úrovne

- [**LLM**](./low_level/llm.md): Trieda LLM je jednotným rozhraním pre poskytovateľa veľkého jazykového modelu, ako napríklad OpenAI GPT-4, Anthropic Claude alebo Meta LLaMA. Môžete ju podtriediť a vytvoriť konektor pre vlastný veľký jazykový model.

- [**Embedding**](./low_level/embedding.md): Embedding je reprezentovaný ako vektor desatinných čísel. Naším predvoleným modelom embeddingu je text-embedding-ada-002 od spoločnosti OpenAI, ktorý generuje embeddingy pozostávajúce z 1 536 desatinných čísel. Ďalším populárnym modelom embeddingu je BERT, ktorý používa 768 desatinných čísel na reprezentáciu každého uzla. Poskytujeme niekoľko nástrojov na prácu s embeddingmi, vrátane 3 možností výpočtu podobnosti a Maximum Marginal Relevance.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): Stratégie rozdelenia textu sú mimoriadne dôležité pre celkovú účinnosť vyhľadávania pomocou embeddingu. Momentálne máme predvolenú stratégiu, ale neexistuje univerzálna riešenie. V závislosti od zdrojových dokumentov môžete chcieť použiť rôzne veľkosti a stratégie rozdelenia. Momentálne podporujeme rozdelenie podľa pevnej veľkosti, rozdelenie podľa pevnej veľkosti s prekryvajúcimi sa sekciami, rozdelenie podľa vety a rozdelenie podľa odseku. Textový rozdeľovač sa používa pri rozdelení `Dokumentov` na `Uzly` v rámci NodeParseru.

- [**Retriever**](./low_level/retriever.md): Retriever je zodpovedný za výber uzlov, ktoré majú byť získané z indexu. Tu môžete skúsiť získať viac alebo menej uzlov na dotaz, zmeniť funkciu podobnosti alebo vytvoriť vlastný retriever pre každý jednotlivý prípad použitia vo vašej aplikácii. Napríklad môžete mať samostatný retriever pre obsah kódu a textový obsah.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): ResponseSynthesizer je zodpovedný za spracovanie reťazca dotazu a použitie zoznamu `Uzlov` na generovanie odpovede. To môže mať rôzne formy, ako napríklad prechádzanie všetkými kontextami a zlepšovanie odpovede alebo vytváranie stromu súhrnov a vrátenie koreňového súhrnu.

- [**Storage**](./low_level/storage.md): V nejakom okamihu budete chcieť uložiť svoje indexy, dáta a vektory, aby ste nemuseli opakovane spúšťať modely embeddingu. IndexStore, DocStore, VectorStore a KVStore sú abstrakcie, ktoré vám to umožňujú. Spoločne tvoria StorageContext. Momentálne vám umožňujeme ukladať vaše embeddingy do súborov na súborovom systéme (alebo do virtuálneho pamäťového súborového systému), ale aktívne pridávame aj integrácie do Vector Databáz.
