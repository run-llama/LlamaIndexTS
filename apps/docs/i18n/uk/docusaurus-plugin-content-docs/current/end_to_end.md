---
sidebar_position: 4
---

# Приклади з кінця до кінця

`Ця документація була автоматично перекладена і може містити помилки. Не соромтеся відкривати Pull Request, щоб запропонувати зміни.`

Ми включили кілька прикладів з використанням LlamaIndex.TS у репозиторії.

Перегляньте наведені нижче приклади або спробуйте їх і завершіть за кілька хвилин з інтерактивними посібниками Github Codespace, наданими Dev-Docs [тут](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Чатовий рушій (Chat Engine)](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Прочитайте файл і обговорюйте його з LLM.

## [Векторний індекс](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Створіть векторний індекс та запитайте його. Векторний індекс буде використовувати вкладення для отримання k найбільш відповідних вузлів. За замовчуванням, k дорівнює 2.

"

## [Індекс підсумків](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Створіть індекс списку та запитайте його. У цьому прикладі також використовується `LLMRetriever`, який використовує LLM для вибору найкращих вузлів для використання при генерації відповіді.

"

## [Збереження / Завантаження індексу](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Створення та завантаження векторного індексу. Автоматичне збереження на диск в LlamaIndex.TS відбувається автоматично після створення об'єкта контексту зберігання.

"

## [Налаштований векторний індекс](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Створіть векторний індекс та запитайте його, налаштувавши `LLM`, `ServiceContext` та `similarity_top_k`.

"

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Створіть OpenAI LLM та безпосередньо використовуйте його для чату.

"

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Створіть Llama-2 LLM та безпосередньо використовуйте його для чату.

"

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Використовує `SubQuestionQueryEngine`, який розбиває складні запити на кілька підзапитів, а потім агрегує відповідь на всі підзапити.

## [Модулі низького рівня](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Цей приклад використовує кілька компонентів низького рівня, що усуває необхідність у фактичному двигуні запитів. Ці компоненти можуть бути використані будь-де, в будь-якому додатку, або налаштовані та підкласифіковані для відповідності вашим потребам.
