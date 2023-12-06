---
sidebar_position: 4
---

# Ejemplos de principio a fin

`Esta documentación ha sido traducida automáticamente y puede contener errores. No dudes en abrir una Pull Request para sugerir cambios.`

Incluimos varios ejemplos de principio a fin utilizando LlamaIndex.TS en el repositorio.

Echa un vistazo a los ejemplos a continuación o pruébalos y complétalos en minutos con los tutoriales interactivos de Github Codespace proporcionados por Dev-Docs [aquí](https://codespaces.new/team-dev-docs/lits-dev-docs-playground?devcontainer_path=.devcontainer%2Fjavascript_ltsquickstart%2Fdevcontainer.json):

## [Motor de Chat](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/chatEngine.ts)

Lee un archivo y chatea sobre él con el LLM.

## [Índice de Vectores](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndex.ts)

Crea un índice de vectores y realiza consultas en él. El índice de vectores utilizará embeddings para obtener los nodos más relevantes en función de los k mejores. De forma predeterminada, el valor de k es 2.

## [Índice de resumen](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/summaryIndex.ts)

Crea un índice de lista y realiza consultas en él. Este ejemplo también utiliza el `LLMRetriever`, que utilizará el LLM para seleccionar los mejores nodos a utilizar al generar una respuesta.

## [Guardar / Cargar un Índice](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/storageContext.ts)

Crea y carga un índice de vectores. La persistencia en disco en LlamaIndex.TS ocurre automáticamente una vez que se crea un objeto de contexto de almacenamiento.

## [Índice de Vector Personalizado](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/vectorIndexCustomize.ts)

Crea un índice de vector y realiza consultas en él, al mismo tiempo que configuras el `LLM`, el `ServiceContext` y el `similarity_top_k`.

## [OpenAI LLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/openai.ts)

Crea un OpenAI LLM y úsalo directamente para chatear.

## [Llama2 DeuceLLM](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/llamadeuce.ts)

Crea un Llama-2 LLM y úsalo directamente para chatear.

## [SubQuestionQueryEngine](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/subquestion.ts)

Utiliza el `SubQuestionQueryEngine`, que divide las consultas complejas en varias preguntas y luego agrega una respuesta a través de las respuestas a todas las subpreguntas.

"

## [Módulos de bajo nivel](https://github.com/run-llama/LlamaIndexTS/blob/main/examples/lowlevel.ts)

Este ejemplo utiliza varios componentes de bajo nivel, lo que elimina la necesidad de un motor de consulta real. Estos componentes se pueden utilizar en cualquier lugar, en cualquier aplicación, o personalizar y subclasificar para satisfacer tus propias necesidades.
