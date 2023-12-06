---
sidebar_position: 3
---

# QueryEngine (Motor de Consulta)

`Esta documentación ha sido traducida automáticamente y puede contener errores. No dudes en abrir una Pull Request para sugerir cambios.`

Un motor de consulta envuelve un `Retriever` y un `ResponseSynthesizer` en un pipeline, que utilizará la cadena de consulta para obtener nodos y luego enviarlos al LLM para generar una respuesta.

```typescript
const queryEngine = index.asQueryEngine();
const response = await queryEngine.query("cadena de consulta");
```

## Motor de Consulta de Subpreguntas

El concepto básico del Motor de Consulta de Subpreguntas es que divide una sola consulta en múltiples consultas, obtiene una respuesta para cada una de esas consultas y luego combina esas respuestas diferentes en una única respuesta coherente para el usuario. Puedes pensar en ello como la técnica de "pensar paso a paso" pero iterando sobre tus fuentes de datos.

### Empezando

La forma más sencilla de comenzar a probar el Motor de Consulta de Subpreguntas es ejecutar el archivo subquestion.ts en [ejemplos](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts).

```bash
npx ts-node subquestion.ts
```

### Herramientas

El Motor de Consulta de Subpreguntas se implementa con Herramientas. La idea básica de las Herramientas es que son opciones ejecutables para el modelo de lenguaje grande. En este caso, nuestro Motor de Consulta de Subpreguntas se basa en QueryEngineTool, que, como habrás adivinado, es una herramienta para ejecutar consultas en un Motor de Consulta. Esto nos permite darle al modelo la opción de consultar diferentes documentos para diferentes preguntas, por ejemplo. También podrías imaginar que el Motor de Consulta de Subpreguntas podría utilizar una Herramienta que busca algo en la web o que obtiene una respuesta utilizando Wolfram Alpha.

Puedes obtener más información sobre las Herramientas echando un vistazo a la documentación de LlamaIndex Python en https://gpt-index.readthedocs.io/en/latest/core_modules/agent_modules/tools/root.html

## Referencia de la API

- [RetrieverQueryEngine (Motor de Consulta de Recuperador)](../../api/classes/RetrieverQueryEngine.md)
- [SubQuestionQueryEngine (Motor de Consulta de Subpreguntas)](../../api/classes/SubQuestionQueryEngine.md)
- [QueryEngineTool (Herramienta de Motor de Consulta)](../../api/interfaces/QueryEngineTool.md)
