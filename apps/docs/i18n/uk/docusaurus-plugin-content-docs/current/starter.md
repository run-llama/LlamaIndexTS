---
sidebar_position: 2
---

# Посібник для початківців

`Ця документація була автоматично перекладена і може містити помилки. Не соромтеся відкривати Pull Request, щоб запропонувати зміни.`

Після того, як ви [встановили LlamaIndex.TS за допомогою NPM](installation) і налаштували свій ключ OpenAI, ви готові розпочати свою першу програму:

У новій папці:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # якщо потрібно
```

Створіть файл `example.ts`. Цей код завантажить деякі прикладові дані, створить документ, проіндексує його (створюючи векторні вкладення за допомогою OpenAI) і потім створить запитовий двигун для відповідей на питання про дані.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Завантажте есе з abramov.txt в Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Створіть об'єкт Document з есе
  const document = new Document({ text: essay });

  // Розбийте текст на частини і створіть вкладення. Збережіть їх у VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Запит до індексу
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query("Що робив автор у коледжі?");

  // Виведення відповіді
  console.log(response.toString());
}

main();
```

Потім ви можете запустити його за допомогою

```bash
npx ts-node example.ts
```

Готові дізнатись більше? Перевірте нашу пісочницю NextJS за адресою https://llama-playground.vercel.app/. Вихідний код доступний за адресою https://github.com/run-llama/ts-playground

"
