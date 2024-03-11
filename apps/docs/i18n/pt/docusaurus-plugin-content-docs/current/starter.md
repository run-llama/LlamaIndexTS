---
sidebar_position: 2
---

# Tutorial Inicial

`Esta documentação foi traduzida automaticamente e pode conter erros. Não hesite em abrir um Pull Request para sugerir alterações.`

Depois de [instalar o LlamaIndex.TS usando o NPM](installation) e configurar sua chave do OpenAI, você está pronto para iniciar seu primeiro aplicativo:

Em uma nova pasta:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # se necessário
```

Crie o arquivo `example.ts`. Este código irá carregar alguns dados de exemplo, criar um documento, indexá-lo (o que cria embeddings usando o OpenAI) e, em seguida, criar um mecanismo de consulta para responder perguntas sobre os dados.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Carrega o ensaio de abramov.txt no Node
  const ensaio = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Cria um objeto Document com o ensaio
  const documento = new Document({ text: ensaio });

  // Divide o texto e cria embeddings. Armazene-os em um VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([documento]);

  // Consulta o índice
  const mecanismoConsulta = index.asQueryEngine();
  const resposta = await mecanismoConsulta.query(
    "O que o autor fez na faculdade?",
  );

  // Exibe a resposta
  console.log(resposta.toString());
}

main();
```

Em seguida, você pode executá-lo usando

```bash
npx ts-node example.ts
```

Pronto para aprender mais? Confira nosso playground NextJS em https://llama-playground.vercel.app/. O código-fonte está disponível em https://github.com/run-llama/ts-playground

"
