# Módulos principales

`Esta documentación ha sido traducida automáticamente y puede contener errores. No dudes en abrir una Pull Request para sugerir cambios.`

LlamaIndex.TS ofrece varios módulos principales, separados en módulos de alto nivel para comenzar rápidamente y módulos de bajo nivel para personalizar los componentes clave según sea necesario.

## Módulos de alto nivel

- [**Documento**](./high_level/documents_and_nodes.md): Un documento representa un archivo de texto, un archivo PDF u otra pieza de datos contiguos.

- [**Nodo**](./high_level/documents_and_nodes.md): El bloque básico de construcción de datos. Comúnmente, estos son partes del documento divididas en piezas manejables que son lo suficientemente pequeñas como para ser alimentadas en un modelo de incrustación y LLM.

- [**Lector/Cargador**](./high_level/data_loader.md): Un lector o cargador es algo que toma un documento del mundo real y lo transforma en una clase Document que luego se puede utilizar en su Índice y consultas. Actualmente admitimos archivos de texto sin formato y PDF con muchos más por venir.

- [**Índices**](./high_level/data_index.md): los índices almacenan los Nodos y las incrustaciones de esos nodos.

- [**Motor de consulta**](./high_level/query_engine.md): Los motores de consulta son los que generan la consulta que ingresas y te devuelven el resultado. Los motores de consulta generalmente combinan una indicación predefinida con nodos seleccionados de su Índice para brindarle al LLM el contexto que necesita para responder su consulta.

- [**Motor de chat**](./high_level/chat_engine.md): Un motor de chat te ayuda a construir un chatbot que interactuará con tus Índices.

## Módulo de bajo nivel

- [**LLM**](./low_level/llm.md): La clase LLM es una interfaz unificada sobre un proveedor de modelos de lenguaje amplio como OpenAI GPT-4, Anthropic Claude o Meta LLaMA. Puede heredar de ella para escribir un conector para su propio modelo de lenguaje amplio.

- [**Embedding**](./low_level/embedding.md): Un embedding se representa como un vector de números de punto flotante. El modelo de embedding predeterminado es text-embedding-ada-002 de OpenAI, y cada embedding que genera consta de 1.536 números de punto flotante. Otro modelo de embedding popular es BERT, que utiliza 768 números de punto flotante para representar cada nodo. Proporcionamos varias utilidades para trabajar con embeddings, incluyendo 3 opciones de cálculo de similitud y Maximum Marginal Relevance.

- [**TextSplitter/NodeParser**](./low_level/node_parser.md): Las estrategias de división de texto son increíblemente importantes para la eficacia general de la búsqueda de embeddings. Actualmente, aunque tenemos una configuración predeterminada, no hay una solución única para todos los casos. Dependiendo de los documentos fuente, es posible que desee utilizar diferentes tamaños y estrategias de división. Actualmente admitimos la división por tamaño fijo, la división por tamaño fijo con secciones superpuestas, la división por oración y la división por párrafo. El text splitter se utiliza en el NodeParser para dividir los `Documentos` en `Nodos`.

- [**Retriever**](./low_level/retriever.md): El Retriever es el encargado de elegir los Nodos que se van a recuperar del índice. Aquí, es posible que desee intentar recuperar más o menos Nodos por consulta, cambiar la función de similitud o crear su propio retriever para cada caso de uso individual en su aplicación. Por ejemplo, es posible que desee tener un retriever separado para el contenido de código y el contenido de texto.

- [**ResponseSynthesizer**](./low_level/response_synthesizer.md): El ResponseSynthesizer es el responsable de tomar una cadena de consulta y utilizar una lista de `Nodos` para generar una respuesta. Esto puede tomar muchas formas, como iterar sobre todo el contexto y refinar una respuesta, o construir un árbol de resúmenes y devolver el resumen principal.

- [**Storage**](./low_level/storage.md): En algún momento, querrá almacenar sus índices, datos y vectores en lugar de volver a ejecutar los modelos de embedding cada vez. IndexStore, DocStore, VectorStore y KVStore son abstracciones que le permiten hacer eso. En conjunto, forman el StorageContext. Actualmente, le permitimos persistir sus embeddings en archivos en el sistema de archivos (o en un sistema de archivos virtual en memoria), pero también estamos agregando activamente integraciones con bases de datos de vectores.
