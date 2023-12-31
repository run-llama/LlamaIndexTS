# Основни модули

`Тази документация е преведена автоматично и може да съдържа грешки. Не се колебайте да отворите Pull Request, за да предложите промени.`

LlamaIndex.TS предлага няколко основни модула, разделени на модули на високо ниво, за бързо стартиране, и модули на ниско ниво, за персонализиране на ключовите компоненти според вашите нужди.

## Модули на високо ниво

- [**Документ**](./high_level/documents_and_nodes.md): Документ представлява текстов файл, PDF файл или друг непрекъснат парче данни.

- [**Възел**](./high_level/documents_and_nodes.md): Основният строителен блок от данни. Най-често това са части от документа, разделени на управляеми парчета, достатъчно малки, за да бъдат подадени на модел за вграждане и LLM.

- [**Четец/Зареждач**](./high_level/data_loader.md): Четецът или зареждачът е нещо, което приема документ от реалния свят и го преобразува в клас Документ, който после може да се използва в индекса и заявките ви. В момента поддържаме обикновени текстови файлове и PDF файлове, с много други, които ще бъдат добавени.

- [**Индекси**](./high_level/data_index.md): Индексите съхраняват Възлите и вгражданията на тези възли.

- [**QueryEngine**](./high_level/query_engine.md): Заявките са това, което генерира заявката, която въвеждате и ви връща резултата. Заявките обикновено комбинират предварително изграден prompt със избрани възли от вашия индекс, за да предоставят на LLM контекста, от който се нуждае, за да отговори на вашата заявка.

- [**ChatEngine**](./high_level/chat_engine.md): ChatEngine ви помага да построите чатбот, който ще взаимодейства с вашите индекси.

## Модули на ниско ниво

- [**LLM**](./low_level/llm.md): Класът LLM е обединен интерфейс над голям доставчик на модели на езика като OpenAI GPT-4, Anthropic Claude или Meta LLaMA. Можете да го наследите, за да напишете конектор към собствен модел на голям език.

- [**Embedding**](./low_level/embedding.md): Вграждането се представя като вектор от числа с плаваща запетая. Нашето вграждане по подразбиране е OpenAI's text-embedding-ada-002 и всяко вграждане, което генерира, се състои от 1,536 числа с плаваща запетая. Друго популярно вграждане е BERT, което използва 768 числа с плаваща запетая, за да представи всеки възел. Предоставяме няколко помощни функции за работа с вграждания, включително 3 опции за изчисляване на подобие и Maximum Marginal Relevance.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): Стратегиите за разделяне на текст са изключително важни за общата ефективност на търсенето на вграждания. В момента, въпреки че имаме стойност по подразбиране, няма универсално решение. В зависимост от източниците на документите, може да искате да използвате различни размери и стратегии за разделяне. В момента поддържаме разделяне по фиксиран размер, разделяне по фиксиран размер с препокриващи се секции, разделяне по изречение и разделяне по параграф. TextSplitter се използва от NodeParser при разделянето на `Document` на `Node`.

- [**Retriever**](./low_level/retriever.md): Retriever е този, който наистина избира възлите за връщане от индекса. Тук може да желаете да опитате да вземете повече или по-малко възли за всяка заявка, да промените функцията за подобие или да създадете собствен retriever за всеки отделен случай в приложението си. Например може да желаете да имате отделен retriever за съдържание на код срещу текстово съдържание.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): ResponseSynthesizer е отговорен за вземането на низ от заявка и използването на списък от `Node`-и за генериране на отговор. Това може да бъде в различни форми, като обхождане на всички контексти и уточняване на отговор, или изграждане на дърво от резюмета и връщане на кореновото резюме.

- [**Storage**](./low_level/storage.md): На някакъв етап ще искате да съхранявате индексите, данните и векторите си, вместо да изпълнявате моделите за вграждане всеки път. IndexStore, DocStore, VectorStore и KVStore са абстракции, които ви позволяват да го направите. Заедно те формират StorageContext. В момента ви позволяваме да запазвате вгражданията си във файлове на файловата система (или виртуална файлова система в паметта), но също така активно добавяме интеграции към Vector Databases.
