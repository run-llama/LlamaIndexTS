# Hlavní moduly

`Tato dokumentace byla automaticky přeložena a může obsahovat chyby. Neváhejte otevřít Pull Request pro navrhování změn.`

LlamaIndex.TS nabízí několik hlavních modulů, které jsou rozděleny na vysoce úrovňové moduly pro rychlý start a nízkoúrovňové moduly pro přizpůsobení klíčových komponent podle vašich potřeb.

## Moduly vyšší úrovně

- [**Dokument**](./high_level/documents_and_nodes.md): Dokument představuje textový soubor, PDF soubor nebo jiný souvislý datový blok.

- [**Uzel**](./high_level/documents_and_nodes.md): Základní stavební blok dat. Nejčastěji se jedná o části dokumentu rozdělené do spravovatelných kusů, které jsou dostatečně malé na to, aby mohly být vloženy do modelu a LLM.

- [**Čtečka/Načítání**](./high_level/data_loader.md): Čtečka nebo načítání je něco, co přijímá dokument ve skutečném světě a přeměňuje ho na třídu Dokument, kterou lze poté použít ve vašem indexu a dotazech. V současné době podporujeme soubory s čistým textem a PDF soubory a mnoho dalších bude následovat.

- [**Indexy**](./high_level/data_index.md): Indexy ukládají uzly a vektory těchto uzlů.

- [**Dotazovací engine**](./high_level/query_engine.md): Dotazovací enginy generují dotaz, který zadáte, a vracejí vám výsledek. Dotazovací enginy obvykle kombinují předem vytvořený prompt s vybranými uzly z vašeho indexu, aby poskytly LLM kontext, který potřebuje k odpovědi na váš dotaz.

- [**Chatovací engine**](./high_level/chat_engine.md): Chatovací engine vám pomáhá vytvořit chatbota, který bude interagovat s vašimi indexy.

## Nízkoúrovňový modul

- [**LLM**](./low_level/llm.md): Třída LLM je sjednocené rozhraní nad velkým poskytovatelem jazykového modelu, jako je OpenAI GPT-4, Anthropic Claude nebo Meta LLaMA. Můžete ji podřídit, abyste vytvořili konektor pro vlastní velký jazykový model.

- [**Embedding**](./low_level/embedding.md): Embedding je reprezentován jako vektor s plovoucími čísly. Výchozím modelem pro embedding je OpenAI text-embedding-ada-002 a každý vygenerovaný embedding se skládá z 1 536 plovoucích čísel. Dalším populárním modelem embeddingu je BERT, který používá 768 plovoucích čísel k reprezentaci každého uzlu. Poskytujeme několik nástrojů pro práci s embeddiny, včetně 3 možností výpočtu podobnosti a Maximum Marginal Relevance.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): Strategie rozdělování textu jsou nesmírně důležité pro celkovou účinnost vyhledávání v embeddinzích. V současné době nemáme žádné univerzální řešení. V závislosti na zdrojových dokumentech můžete chtít použít různé velikosti a strategie rozdělování. V současné době podporujeme rozdělování podle pevné velikosti, rozdělování podle pevné velikosti s překrývajícími se částmi, rozdělování podle věty a rozdělování podle odstavce. Textový splitter je používán NodeParserem při rozdělování `Dokumentů` na `Uzly`.

- [**Retriever**](./low_level/retriever.md): Retriever je ten, který skutečně vybírá uzly, které mají být získány z indexu. Zde můžete zkusit získat více nebo méně uzlů na dotaz, změnit funkci podobnosti nebo vytvořit vlastní retriever pro každý jednotlivý případ použití ve vaší aplikaci. Například můžete mít samostatného retrievera pro obsah kódu a textový obsah.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): ResponseSynthesizer je zodpovědný za přijetí řetězce dotazu a použití seznamu `Uzly` k vygenerování odpovědi. To může mít různé formy, například procházení všech kontextů a zpřesňování odpovědi nebo vytváření stromu shrnutí a vrácení kořenového shrnutí.

- [**Storage**](./low_level/storage.md): V nějakém okamžiku budete chtít uložit své indexy, data a vektory místo opakovaného spouštění modelů embeddingu pokaždé. IndexStore, DocStore, VectorStore a KVStore jsou abstrakce, které vám to umožňují. Společně tvoří StorageContext. V současné době vám umožňujeme ukládat vaše embeddiny do souborů na souborovém systému (nebo do virtuálního paměťového souborového systému), ale aktivně také přidáváme integrace do Vector Databází.
