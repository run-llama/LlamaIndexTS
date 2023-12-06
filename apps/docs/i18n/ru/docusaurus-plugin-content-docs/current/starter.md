---
sidebar_position: 2
---

# Руководство для начинающих

`Эта документация была автоматически переведена и может содержать ошибки. Не стесняйтесь открывать Pull Request для предложения изменений.`

После того, как вы [установили LlamaIndex.TS с помощью NPM](installation) и настроили свой ключ OpenAI, вы готовы начать работу с вашим первым приложением:

В новой папке:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # если необходимо
```

Создайте файл `example.ts`. Этот код загрузит некоторые примеры данных, создаст документ, проиндексирует его (что создаст вложения с использованием OpenAI), а затем создаст поисковую систему для ответов на вопросы о данных.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Загрузка эссе из abramov.txt в Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Создание объекта Document с эссе
  const document = new Document({ text: essay });

  // Разделение текста и создание вложений. Сохранение их в VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Запрос к индексу
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query("Что автор делал в колледже?");

  // Вывод ответа
  console.log(response.toString());
}

main();
```

Затем вы можете запустить его с помощью

```bash
npx ts-node example.ts
```

Готовы узнать больше? Посетите нашу площадку NextJS по адресу https://llama-playground.vercel.app/. Исходный код доступен по адресу https://github.com/run-llama/ts-playground

"
