# Основні модулі

`Ця документація була автоматично перекладена і може містити помилки. Не соромтеся відкривати Pull Request, щоб запропонувати зміни.`

LlamaIndex.TS пропонує кілька основних модулів, розділених на високорівневі модулі для швидкого початку роботи та низькорівневі модулі для налаштування ключових компонентів за потребою.

## Високорівневі модулі

- [**Документ**](./high_level/documents_and_nodes.md): Документ представляє собою текстовий файл, файл PDF або інший послідовний шматок даних.

- [**Вузол**](./high_level/documents_and_nodes.md): Основний будівельний блок даних. Зазвичай це частини документа, розділені на керовані шматки, які достатньо малі, щоб їх можна було передати в модель вбудовування та LLM.

- [**Reader/Loader**](./high_level/data_loader.md): Рідер або завантажувач - це щось, що приймає документ у реальному світі та перетворює його на клас Документа, який потім можна використовувати в вашому Індексі та запитах. Наразі ми підтримуємо звичайні текстові файли та PDF-файли, але незабаром буде багато інших форматів.

- [**Індекси**](./high_level/data_index.md): індекси зберігають Вузли та вбудовування цих вузлів.

- [**QueryEngine**](./high_level/query_engine.md): Двигуни запитів - це ті, що генерують запит, який ви вводите, і повертають вам результат. Зазвичай двигуни запитів поєднують попередньо побудований запит з вибраними вузлами з вашого Індексу, щоб надати LLM контекст, який потрібен для відповіді на ваш запит.

- [**ChatEngine**](./high_level/chat_engine.md): ChatEngine допомагає вам створити чат-бота, який буде взаємодіяти з вашими Індексами.

## Низькорівневий модуль

- [**LLM**](./low_level/llm.md): Клас LLM є єдиною інтерфейсною оболонкою над великим постачальником мовних моделей, таких як OpenAI GPT-4, Anthropic Claude або Meta LLaMA. Ви можете успадкувати його, щоб написати з'єднувач до власної великої мовної моделі.

- [**Embedding**](./low_level/embedding.md): Вкладення представляється у вигляді вектора чисел з плаваючою комою. Нашою типовою моделлю вкладення є text-embedding-ada-002 від OpenAI, і кожне вкладення, яке вона генерує, складається з 1536 чисел з плаваючою комою. Ще одна популярна модель вкладення - BERT, яка використовує 768 чисел з плаваючою комою для представлення кожного вузла. Ми надаємо кілька утиліт для роботи з вкладеннями, включаючи 3 варіанти обчислення схожості та максимальної маржинальної релевантності.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): Стратегії розбиття тексту на частини мають велике значення для загальної ефективності пошуку вкладень. Наразі, хоча у нас є типове значення, немає універсального рішення. Залежно від джерела документів, ви можете використовувати різні розміри та стратегії розбиття. Наразі ми підтримуємо розбиття за фіксованим розміром, розбиття за фіксованим розміром з перекриваючими секціями, розбиття за реченням та розбиття за абзацем. Розбійник тексту використовується NodeParser при розбитті `Документів` на `Вузли`.

- [**Retriever**](./low_level/retriever.md): Ретрівер насправді вибирає Вузли для отримання з індексу. Тут ви можете спробувати отримати більше або менше Вузлів за запитом, змінити функцію схожості або створити власний ретрівер для кожного окремого випадку використання у вашому додатку. Наприклад, ви можете мати окремого ретрівера для кодового вмісту та текстового вмісту.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): ResponseSynthesizer відповідає за прийняття рядка запиту та використання списку `Вузлів` для генерації відповіді. Це може мати різні форми, наприклад, ітерування по всьому контексту та уточнення відповіді або побудова дерева резюме та повернення кореневого резюме.

- [**Storage**](./low_level/storage.md): Рано чи пізно вам захочеться зберігати ваші індекси, дані та вектори, а не запускати моделі вкладення кожного разу. IndexStore, DocStore, VectorStore та KVStore - це абстракції, які дозволяють вам це зробити. Разом вони утворюють StorageContext. Наразі ми дозволяємо зберігати ваші вкладення у файлах на файловій системі (або віртуальній файловій системі в оперативній пам'яті), але також активно додаємо інтеграції з векторними базами даних.
