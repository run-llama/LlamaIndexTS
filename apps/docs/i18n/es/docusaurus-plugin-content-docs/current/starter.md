---
sidebar_position: 2
---

# Tutorial de Inicio

`Esta documentación ha sido traducida automáticamente y puede contener errores. No dudes en abrir una Pull Request para sugerir cambios.`

Una vez que hayas [instalado LlamaIndex.TS usando NPM](installation) y configurado tu clave de OpenAI, estás listo para comenzar tu primera aplicación:

En una nueva carpeta:

```bash npm2yarn
npm install typescript
npm install @types/node
npx tsc --init # si es necesario
```

Crea el archivo `example.ts`. Este código cargará algunos datos de ejemplo, creará un documento, lo indexará (lo cual crea embeddings utilizando OpenAI) y luego creará un motor de consulta para responder preguntas sobre los datos.

```ts
// example.ts
import fs from "fs/promises";
import { Document, VectorStoreIndex } from "llamaindex";

async function main() {
  // Carga el ensayo desde abramov.txt en Node
  const ensayo = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );

  // Crea un objeto Document con el ensayo
  const documento = new Document({ text: ensayo });

  // Divide el texto y crea embeddings. Almacénalos en un VectorStoreIndex
  const indice = await VectorStoreIndex.fromDocuments([documento]);

  // Consulta el índice
  const motorConsulta = indice.asQueryEngine();
  const respuesta = await motorConsulta.query(
    "¿Qué hizo el autor en la universidad?",
  );

  // Muestra la respuesta
  console.log(respuesta.toString());
}

main();
```

Luego puedes ejecutarlo usando

```bash
npx ts-node example.ts
```

¿Listo para aprender más? Echa un vistazo a nuestro playground de NextJS en https://llama-playground.vercel.app/. El código fuente está disponible en https://github.com/run-llama/ts-playground

"
