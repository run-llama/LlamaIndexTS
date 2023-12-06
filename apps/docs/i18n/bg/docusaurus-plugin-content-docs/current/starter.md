---
sidebar_position: 2
---

# Начално ръководство

`Тази документация е преведена автоматично и може да съдържа грешки. Не се колебайте да отворите Pull Request, за да предложите промени.`

След като сте [инсталирали LlamaIndex.TS с помощта на NPM](installation) и сте настроили вашия OpenAI ключ, вие сте готови да стартирате първото си приложение:

В нова папка:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # ако е необходимо
```

Създайте файла `example.ts`. Този код ще зареди някакви примерни данни, ще създаде документ, ще го индексира (което създава вграждания с помощта на OpenAI) и след това ще създаде търсачка, която да отговаря на въпроси относно данните.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Заредете есе от abramov.txt в Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Създайте обект Document с есето
  const document = new Document({ text: essay });

  // Разделете текста и създайте вграждания. Запазете ги в VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Заявете индекса
  const queryEngine = index.asQueryEngine();
  const response = await queryEngine.query(
    "Какво направи авторът по време на колеж?",
  );

  // Изведете отговора
  console.log(response.toString());
}

main();
```

След това можете да го стартирате чрез

```bash
npx ts-node example.ts
```

Готови ли сте да научите още? Проверете нашия NextJS игрален площад на адрес https://llama-playground.vercel.app/. Изходният код е достъпен на адрес https://github.com/run-llama/ts-playground

"
